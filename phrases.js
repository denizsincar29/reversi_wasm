export const PHRASES = {
    thinking: [
        "Let me think...",
        "Hmm, interesting move. Let me see...",
        "Analyzing the board...",
        "Calculating my next move...",
        "I'm considering my options...",
        "One moment, I'm thinking...",
        "This is a tough one. Let me think...",
        "Strategizing...",
        "Looking for the best path...",
        "Wait, I'm thinking...",
        "Almost there, just a bit more thought...",
        "Evaluating the possibilities...",
        "I'm planning my victory...",
        "Don't rush me, I'm thinking...",
        "Thinking deep..."
    ],
    quality: {
        excellent: [
            "Excellent move!",
            "Awesome!!!",
            "Brilliant play!",
            "You're a pro!",
            "That was a masterstroke!"
        ],
        good: [
            "Good move.",
            "Well, not bad!!!",
            "Solid play.",
            "I like that.",
            "Nice one."
        ],
        fair: [
            "Fair enough.",
            "Okay.",
            "I see what you're doing.",
            "Not the worst, but not the best.",
            "Acceptable."
        ],
        bad: [
            "Oops! too bad move!",
            "That was a mistake.",
            "Are you sure about that?",
            "You might regret that.",
            "Not your best effort."
        ],
        blunder: [
            "Total blunder!",
            "Oh no, that was terrible!",
            "Did you mean to do that?",
            "I'm going to take advantage of that!",
            "That's a huge mistake!"
        ]
    },
    announcements: {
        playerMove: (coord, color, flips) => `${coord} ${color} placed, flipped ${flips} disks.`,
        aiMoveFirstPerson: (coord, color, flips) => `I played at ${coord} as ${color}, flipping ${flips} disks.`,
        aiMoveThirdPerson: (name, coord, color, flips) => `${name} played at ${coord} as ${color}, flipping ${flips} disks.`,
        pass: (player) => `${player} has no legal moves. Passing.`
    }
};
