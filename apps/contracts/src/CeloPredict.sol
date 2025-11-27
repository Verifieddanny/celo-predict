// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CeloPredict {
    struct EventInfo {
        string title; // "Nigeria vs Ghana"
        string description; // optional detail
        uint256 deadline; // timestamp to stop betting
        bool resolved;
        uint8 winningOutcome; // 0, 1, or 2
        bool active;
    }

    struct Bet {
        uint256 amount;
        uint8 outcome; // 0, 1, 2
        bool claimed;
    }

    address public owner;
    uint256 public eventCount;

    mapping(uint256 => EventInfo) public events;
    mapping(uint256 => mapping(uint8 => uint256)) public outcomeTotals;
    mapping(uint256 => mapping(address => Bet)) public bets;
    mapping(address => uint256[]) private userEvents;

    event EventCreated(uint256 indexed eventId, string title, uint256 deadline);
    event BetPlaced(
        uint256 indexed eventId,
        address indexed user,
        uint8 outcome,
        uint256 amount
    );
    event EventResolved(uint256 indexed eventId, uint8 winningOutcome);
    event RewardClaimed(
        uint256 indexed eventId,
        address indexed user,
        uint256 reward
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier eventExists(uint256 eventId) {
        require(eventId < eventCount, "Event does not exist");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function createEvent(
        string memory _title,
        string memory _description,
        uint256 _deadline
    ) external onlyOwner {
        require(_deadline > block.timestamp, "Deadline must be in future");

        uint256 id = eventCount;
        events[id] = EventInfo({
            title: _title,
            description: _description,
            deadline: _deadline,
            resolved: false,
            winningOutcome: 0,
            active: true
        });

        eventCount += 1;
        emit EventCreated(id, _title, _deadline);
    }

    function placeBet(
        uint256 eventId,
        uint8 outcome
    ) external payable eventExists(eventId) {
        EventInfo storage e = events[eventId];
        require(e.active, "Event not active");
        require(block.timestamp < e.deadline, "Betting closed");
        require(outcome <= 2, "Invalid outcome");
        require(msg.value > 0, "Must send CELO");
        require(bets[eventId][msg.sender].amount == 0, "Already bet");

        bets[eventId][msg.sender] = Bet({
            amount: msg.value,
            outcome: outcome,
            claimed: false
        });

        outcomeTotals[eventId][outcome] += msg.value;

        userEvents[msg.sender].push(eventId);

        emit BetPlaced(eventId, msg.sender, outcome, msg.value);
    }

    function resolveEvent(
        uint256 eventId,
        uint8 winningOutcome
    ) external onlyOwner eventExists(eventId) {
        EventInfo storage e = events[eventId];
        require(e.active, "Event not active");
        require(!e.resolved, "Already resolved");
        require(block.timestamp >= e.deadline, "Too early");
        require(winningOutcome <= 2, "Invalid outcome");

        e.resolved = true;
        e.winningOutcome = winningOutcome;

        emit EventResolved(eventId, winningOutcome);
    }

    function claimReward(uint256 eventId) external eventExists(eventId) {
        EventInfo storage e = events[eventId];
        require(e.resolved, "Event not resolved");

        Bet storage b = bets[eventId][msg.sender];
        require(!b.claimed, "Already claimed");
        require(b.amount > 0, "No bet");
        require(b.outcome == e.winningOutcome, "Not a winner");

        uint256 totalPool = outcomeTotals[eventId][0] +
            outcomeTotals[eventId][1] +
            outcomeTotals[eventId][2];

        uint256 winningTotal = outcomeTotals[eventId][e.winningOutcome];
        require(winningTotal > 0, "No winners");

        uint256 reward = (b.amount * totalPool) / winningTotal;
        b.claimed = true;

        (bool ok, ) = msg.sender.call{value: reward}("");
        require(ok, "Transfer failed");

        emit RewardClaimed(eventId, msg.sender, reward);
    }

    /////////Getter functions/////////
    function getEvent(
        uint256 eventId
    ) external view eventExists(eventId) returns (EventInfo memory) {
        return events[eventId];
    }

    function getPool(
        uint256 eventId
    )
        external
        view
        eventExists(eventId)
        returns (uint256 total, uint256 o0, uint256 o1, uint256 o2)
    {
        o0 = outcomeTotals[eventId][0];
        o1 = outcomeTotals[eventId][1];
        o2 = outcomeTotals[eventId][2];
        total = o0 + o1 + o2;
    }

    function getUserEvents(
        address user
    ) external view returns (uint256[] memory) {
        return userEvents[user];
    }

    function getBet(
        uint256 eventId,
        address user
    ) external view eventExists(eventId) returns (Bet memory) {
        return bets[eventId][user];
    }
}
