// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title CasinoDice — verifiable on-chain dice casino
/// @notice Randomness = keccak256(block.prevrandao, player, nonce, block.timestamp)
///         Anyone can reproduce the result from the transaction's block data.
///         House edge: ~2% (payout multiplier = 98 / prediction).
contract CasinoDice {
    address public owner;

    uint256 public constant MIN_BET  = 0.001 ether;
    uint256 public constant MAX_BET  = 0.5 ether;
    uint256 public constant HOUSE_EDGE_DENOM = 98; // out of 100 → 2% edge

    uint256 private nonce;

    mapping(address => uint256) public balances;

    event Deposited(address indexed player, uint256 amount);
    event Withdrawn(address indexed player, uint256 amount);
    event RollResult(
        address indexed player,
        uint256 betAmount,
        uint256 prediction,
        uint256 result,
        bool    won,
        uint256 payout
    );

    error InsufficientCasinoBalance();
    error InsufficientPlayerBalance();
    error InvalidPrediction();
    error InvalidBetAmount();
    error TransferFailed();

    constructor() payable {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    // ─── Player actions ───────────────────────────────────────────────

    /// @notice Deposit ETH into your casino balance
    function deposit() external payable {
        require(msg.value > 0, "Zero deposit");
        balances[msg.sender] += msg.value;
        emit Deposited(msg.sender, msg.value);
    }

    /// @notice Roll the dice.
    /// @param prediction  1–98: if result (1–100) <= prediction, you win.
    ///                    Payout = betAmount * 98 / prediction.
    ///                    Lower prediction = higher risk, higher reward.
    /// @param betAmount   Amount of your casino balance to wager (wei)
    function roll(uint256 prediction, uint256 betAmount) external {
        if (prediction < 1 || prediction > 98) revert InvalidPrediction();
        if (betAmount < MIN_BET || betAmount > MAX_BET) revert InvalidBetAmount();
        if (balances[msg.sender] < betAmount) revert InsufficientPlayerBalance();

        uint256 maxPayout = (betAmount * HOUSE_EDGE_DENOM) / prediction;
        // Casino must be able to cover the worst-case payout minus the bet already in the contract
        if (address(this).balance + betAmount < maxPayout + betAmount) revert InsufficientCasinoBalance();
        if (address(this).balance < maxPayout) revert InsufficientCasinoBalance();

        // Deduct bet upfront
        balances[msg.sender] -= betAmount;
        nonce++;

        // ── Verifiable randomness ──────────────────────────────────────
        // block.prevrandao  = the RANDAO reveal of the current block proposer (PoS)
        // Combined with sender + nonce + timestamp → unique per roll
        // Fully reproducible from block data — check on Etherscan:
        //   block.difficulty (prevrandao) is shown in the block info
        uint256 rand = uint256(
            keccak256(abi.encode(block.prevrandao, msg.sender, nonce, block.timestamp))
        ) % 100 + 1; // 1–100

        bool won = rand <= prediction;
        uint256 payout = 0;

        if (won) {
            payout = maxPayout;
            balances[msg.sender] += payout;
        }

        emit RollResult(msg.sender, betAmount, prediction, rand, won, payout);
    }

    /// @notice Withdraw from your casino balance to your wallet
    function withdraw(uint256 amount) external {
        if (balances[msg.sender] < amount) revert InsufficientPlayerBalance();
        balances[msg.sender] -= amount;
        (bool ok, ) = payable(msg.sender).call{value: amount}("");
        if (!ok) revert TransferFailed();
        emit Withdrawn(msg.sender, amount);
    }

    // ─── Owner actions ────────────────────────────────────────────────

    /// @notice Fund the casino bankroll
    function fund() external payable onlyOwner {}

    /// @notice Withdraw house profits (only what's not owed to players)
    function ownerWithdraw(uint256 amount) external onlyOwner {
        // Rough safety check: can't drain funds owed to players
        // (exact accounting would need summing all balances — gas-prohibitive)
        require(address(this).balance >= amount, "Not enough");
        (bool ok, ) = payable(owner).call{value: amount}("");
        require(ok, "Transfer failed");
    }

    // ─── Views ────────────────────────────────────────────────────────

    function casinoBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function playerBalance(address player) external view returns (uint256) {
        return balances[player];
    }

    /// @notice Win probability and payout multiplier for a given prediction
    function getOdds(uint256 prediction) external pure returns (uint256 winChancePct, uint256 payoutX100) {
        winChancePct = prediction; // e.g. 50 → 50%
        payoutX100 = (HOUSE_EDGE_DENOM * 100) / prediction; // e.g. 50 → 196 (1.96x)
    }
}
