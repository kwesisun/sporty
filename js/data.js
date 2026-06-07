// ================================================================
//  SportyWin — Match & Game Data
// ================================================================

const MATCHES_DATA = {
  football: [
    {
      league: "Premier League",
      flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
      matches: [
        {
          id: "m001", home: "Arsenal", away: "Man United",
          time: "Today 20:00", isLive: false, liveScore: null,
          minute: null,
          odds: { "1": 1.85, "X": 3.40, "2": 4.50 },
          moreCount: 86
        },
        {
          id: "m002", home: "Chelsea", away: "Liverpool",
          time: "Today 17:30", isLive: true, liveScore: "1-1",
          minute: "67'",
          odds: { "1": 3.20, "X": 3.10, "2": 2.25 },
          moreCount: 92
        },
        {
          id: "m003", home: "Man City", away: "Tottenham",
          time: "Tomorrow 14:00", isLive: false, liveScore: null,
          minute: null,
          odds: { "1": 1.42, "X": 4.80, "2": 7.00 },
          moreCount: 84
        },
        {
          id: "m004", home: "Aston Villa", away: "Newcastle",
          time: "Tomorrow 16:30", isLive: false, liveScore: null,
          minute: null,
          odds: { "1": 2.10, "X": 3.25, "2": 3.50 },
          moreCount: 72
        },
      ]
    },
    {
      league: "La Liga",
      flag: "🇪🇸",
      matches: [
        {
          id: "m005", home: "Barcelona", away: "Real Madrid",
          time: "Today 21:00", isLive: false, liveScore: null,
          minute: null,
          odds: { "1": 2.30, "X": 3.40, "2": 2.95 },
          moreCount: 110
        },
        {
          id: "m006", home: "Atletico Madrid", away: "Sevilla",
          time: "Today 18:30", isLive: true, liveScore: "2-0",
          minute: "78'",
          odds: { "1": 1.60, "X": 4.00, "2": 6.00 },
          moreCount: 88
        },
        {
          id: "m007", home: "Valencia", away: "Villarreal",
          time: "Tomorrow 19:00", isLive: false, liveScore: null,
          minute: null,
          odds: { "1": 2.45, "X": 3.20, "2": 2.85 },
          moreCount: 68
        }
      ]
    },
    {
      league: "Serie A",
      flag: "🇮🇹",
      matches: [
        {
          id: "m008", home: "AC Milan", away: "Inter Milan",
          time: "Today 20:45", isLive: false, liveScore: null,
          minute: null,
          odds: { "1": 2.55, "X": 3.30, "2": 2.70 },
          moreCount: 96
        },
        {
          id: "m009", home: "Juventus", away: "Napoli",
          time: "Tomorrow 20:45", isLive: false, liveScore: null,
          minute: null,
          odds: { "1": 2.00, "X": 3.40, "2": 3.60 },
          moreCount: 90
        }
      ]
    },
    {
      league: "Bundesliga",
      flag: "🇩🇪",
      matches: [
        {
          id: "m010", home: "Bayern Munich", away: "Borussia Dortmund",
          time: "Today 15:30", isLive: true, liveScore: "3-1",
          minute: "82'",
          odds: { "1": 1.45, "X": 4.70, "2": 7.50 },
          moreCount: 94
        },
        {
          id: "m011", home: "RB Leipzig", away: "Bayer Leverkusen",
          time: "Today 15:30", isLive: true, liveScore: "0-1",
          minute: "55'",
          odds: { "1": 2.80, "X": 3.20, "2": 2.40 },
          moreCount: 80
        },
        {
          id: "m012", home: "Freiburg", away: "Wolfsburg",
          time: "Tomorrow 14:30", isLive: false, liveScore: null,
          minute: null,
          odds: { "1": 2.20, "X": 3.10, "2": 3.30 },
          moreCount: 62
        }
      ]
    },
    {
      league: "Ghana Premier League",
      flag: "🇬🇭",
      matches: [
        {
          id: "m013", home: "Accra Hearts of Oak", away: "Asante Kotoko",
          time: "Today 15:00", isLive: false, liveScore: null,
          minute: null,
          odds: { "1": 2.50, "X": 3.20, "2": 2.65 },
          moreCount: 48
        },
        {
          id: "m014", home: "Medeama SC", away: "Dreams FC",
          time: "Today 15:00", isLive: true, liveScore: "1-0",
          minute: "34'",
          odds: { "1": 1.90, "X": 3.40, "2": 3.75 },
          moreCount: 38
        }
      ]
    },
    {
      league: "CAF Champions League",
      flag: "🌍",
      matches: [
        {
          id: "m015", home: "Al Ahly", away: "Wydad Casablanca",
          time: "Tomorrow 19:00", isLive: false, liveScore: null,
          minute: null,
          odds: { "1": 1.75, "X": 3.50, "2": 4.50 },
          moreCount: 56
        },
        {
          id: "m016", home: "Sundowns", away: "TP Mazembe",
          time: "Tomorrow 16:00", isLive: false, liveScore: null,
          minute: null,
          odds: { "1": 1.65, "X": 3.60, "2": 5.00 },
          moreCount: 44
        }
      ]
    }
  ],
  basketball: [
    {
      league: "NBA",
      flag: "🇺🇸",
      matches: [
        {
          id: "b001", home: "LA Lakers", away: "Golden State Warriors",
          time: "Today 02:00", isLive: false, liveScore: null,
          minute: null,
          odds: { "1": 1.90, "X": null, "2": 1.90 },
          moreCount: 42
        },
        {
          id: "b002", home: "Boston Celtics", away: "Miami Heat",
          time: "Today 00:30", isLive: true, liveScore: "88-72",
          minute: "Q3",
          odds: { "1": 1.35, "X": null, "2": 3.00 },
          moreCount: 38
        }
      ]
    }
  ],
  tennis: [
    {
      league: "ATP Wimbledon",
      flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
      matches: [
        {
          id: "t001", home: "Novak Djokovic", away: "Carlos Alcaraz",
          time: "Today 14:00", isLive: false, liveScore: null,
          minute: null,
          odds: { "1": 1.75, "X": null, "2": 2.05 },
          moreCount: 28
        }
      ]
    }
  ]
};

const LIVE_MATCHES = [
  { id: "l001", sport: "⚽", home: "Chelsea", away: "Liverpool", score: "1-1", minute: "67'", league: "Premier League", odds: { "1": 3.20, "X": 2.90, "2": 2.10 } },
  { id: "l002", sport: "⚽", home: "Bayern Munich", away: "Borussia Dortmund", score: "3-1", minute: "82'", league: "Bundesliga", odds: { "1": 1.20, "X": 7.00, "2": 12.00 } },
  { id: "l003", sport: "⚽", home: "Atletico Madrid", away: "Sevilla", score: "2-0", minute: "78'", league: "La Liga", odds: { "1": 1.15, "X": 8.00, "2": 15.00 } },
  { id: "l004", sport: "🏀", home: "Boston Celtics", away: "Miami Heat", score: "88-72", minute: "Q3", league: "NBA", odds: { "1": 1.20, "X": null, "2": 4.50 } },
  { id: "l005", sport: "⚽", home: "RB Leipzig", away: "Bayer Leverkusen", score: "0-1", minute: "55'", league: "Bundesliga", odds: { "1": 3.10, "X": 3.00, "2": 2.20 } },
  { id: "l006", sport: "⚽", home: "Medeama SC", away: "Dreams FC", score: "1-0", minute: "34'", league: "GPL", odds: { "1": 1.60, "X": 3.80, "2": 4.80 } }
];

const CASINO_GAMES = [
  { id: "c001", name: "Aviator", icon: "✈️", provider: "Spribe", hot: true },
  { id: "c002", name: "Book of Dead", icon: "📖", provider: "Play'n GO", hot: false },
  { id: "c003", name: "Gates of Olympus", icon: "⚡", provider: "Pragmatic Play", hot: true },
  { id: "c004", name: "Sweet Bonanza", icon: "🍬", provider: "Pragmatic Play", hot: false },
  { id: "c005", name: "Wolf Gold", icon: "🐺", provider: "Pragmatic Play", hot: false },
  { id: "c006", name: "Starburst", icon: "⭐", provider: "NetEnt", hot: false },
  { id: "c007", name: "Mega Moolah", icon: "🦁", provider: "Microgaming", hot: false },
  { id: "c008", name: "Gonzo's Quest", icon: "🗺️", provider: "NetEnt", hot: false },
  { id: "c009", name: "Age of Gods", icon: "🏛️", provider: "Playtech", hot: false },
  { id: "c010", name: "Lightning Roulette", icon: "⚡🎰", provider: "Evolution", hot: true },
  { id: "c011", name: "Live Blackjack", icon: "🃏", provider: "Evolution", hot: false },
  { id: "c012", name: "Crazy Time", icon: "🎡", provider: "Evolution", hot: true }
];

const VIRTUAL_SPORTS = [
  { id: "v001", name: "Virtual Football", icon: "⚽", desc: "Every 3 minutes", badge: "LIVE" },
  { id: "v002", name: "Virtual Horse Racing", icon: "🐎", desc: "Every 4 minutes", badge: "LIVE" },
  { id: "v003", name: "Virtual Dog Racing", icon: "🐕", desc: "Every 3 minutes", badge: "LIVE" },
  { id: "v004", name: "Virtual Cycling", icon: "🚴", desc: "Every 5 minutes", badge: "UPCOMING" },
  { id: "v005", name: "Virtual Tennis", icon: "🎾", desc: "Every 6 minutes", badge: "LIVE" },
  { id: "v006", name: "Virtual Basketball", icon: "🏀", desc: "Every 5 minutes", badge: "UPCOMING" }
];

const RECENT_RESULTS = [
  { home: "Arsenal", away: "Wolves", score: "3-1", time: "Sat, 22:00", league: "Premier League" },
  { home: "AC Milan", away: "Roma", score: "2-2", time: "Sat, 20:45", league: "Serie A" },
  { home: "PSG", away: "Lyon", score: "4-0", time: "Sat, 21:00", league: "Ligue 1" },
  { home: "Dortmund", away: "Mainz", score: "2-1", time: "Sat, 17:30", league: "Bundesliga" },
  { home: "Tottenham", away: "Everton", score: "2-0", time: "Sat, 15:00", league: "Premier League" },
  { home: "Asante Kotoko", away: "Hearts of Oak", score: "1-1", time: "Sat, 15:00", league: "GPL" },
  { home: "Al Ahly", away: "Zamalek", score: "2-0", time: "Fri, 19:00", league: "CAF CL" },
  { home: "Napoli", away: "Lazio", score: "1-0", time: "Fri, 20:45", league: "Serie A" }
];

const PROMOTIONS = [
  {
    id: "p001", icon: "🎁",
    title: "Welcome Bonus — 100% up to GH₵500",
    desc: "New customers get a 100% match bonus on their first deposit. Min deposit GH₵50. T&Cs apply.",
    cta: "Claim Now"
  },
  {
    id: "p002", icon: "⚡",
    title: "Acca Boost — Up to 50% Extra Winnings",
    desc: "Boost your accumulator winnings by up to 50% when you select 5 or more teams. No opt-in required.",
    cta: "Learn More"
  },
  {
    id: "p003", icon: "🔥",
    title: "Daily Jackpot — GH₵1,250,000",
    desc: "Pick 6 correct scores every day. Free entry with any bet of GH₵5 or more. Next draw at 22:00.",
    cta: "Enter Now"
  },
  {
    id: "p004", icon: "💰",
    title: "Refer a Friend — Earn GH₵50",
    desc: "Share your referral code with friends. Earn GH₵50 bonus for each friend who registers and deposits.",
    cta: "Get Code"
  },
  {
    id: "p005", icon: "🎯",
    title: "Free Bet Friday",
    desc: "Every Friday deposit GH₵100 or more and receive a GH₵20 free bet. Valid on weekends only.",
    cta: "Claim Free Bet"
  },
  {
    id: "p006", icon: "🏆",
    title: "Champions League Special Odds",
    desc: "Enhanced odds every week on selected Champions League matches. Sign in to see today's boosts.",
    cta: "View Boosts"
  }
];
