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
  { id: "c001", name: "Aviator",            img: "https://s.sporty.net/sportygames/lobby_banner/1648540402134.png",                    provider: "Turbo Games",  hot: true,  cat: "crash"   },
  { id: "c002", name: "Sporty Hero",        img: "https://s.sporty.net/common/main/res/5c244dd872207dc67f92cb35b8cef7c3.png",          provider: "SportyGames",  hot: true,  cat: "crash"   },
  { id: "c003", name: "Lucky Numbers",      img: "https://s.sporty.net/cms/game_lobby_banner_num_0ad1b6c20c.png",                      provider: "SportyGames",  hot: true,  cat: "numbers" },
  { id: "c004", name: "Live Games",         img: "https://s.sporty.net/ke/main/res/8337b77ee05ec2ce2ce838c77dd7a14e.png",              provider: "SportyBet",    hot: false, cat: "live"    },
  { id: "c005", name: "Instant Virtuals",   img: "https://s.football.com/common/main/res/b67864193fc68f87b90b7a7722752c7f.png",        provider: "SportyBet",    hot: false, cat: "live"    },
  { id: "c006", name: "Sporty Roulette",    img: "https://s.sporty.net/common/main/res/ca11c6474c3756ad3acfdeaa9ac276ec.png",          provider: "SportyGames",  hot: false, cat: "table"   },
  { id: "c007", name: "Blackjack",          img: "https://s.sporty.net/common/main/res/53dcdd528c8b5b0e74164af4173d4b8.png",           provider: "SportyGames",  hot: false, cat: "table"   },
  { id: "c008", name: "SicBo",              img: "https://s.sporty.net/common/main/res/ab40d7945054629add00863b6cfdb0e0.png",          provider: "SportyGames",  hot: false, cat: "table"   },
  { id: "c009", name: "Sporty Hi-Lo",       img: "https://s.sporty.net/common/main/res/d6b60715735e5d9e675b9383bab81781.png",          provider: "SportyGames",  hot: false, cat: "table"   },
  { id: "c010", name: "Turbo HiLo",         img: "https://s.sporty.net/sportygames/lobby_banner/1648540291968.png",                    provider: "Turbo Games",  hot: false, cat: "table"   },
  { id: "c011", name: "Mini Roulette",      img: "https://s.sporty.net/sportygames/lobby_banner/1648540232060.png",                    provider: "Turbo Games",  hot: false, cat: "table"   },
  { id: "c012", name: "Lucky Poker",        img: "https://s.sporty.net/gh/ms/spr_game_poker.png",                                     provider: "SportyGames",  hot: false, cat: "table"   },
  { id: "c013", name: "Sporty Stud Poker",  img: "https://s.sporty.net/common/main/res/8c3dc6678ee7ce1304e24976de9e531b.png",          provider: "SportyGames",  hot: false, cat: "table"   },
  { id: "c014", name: "Sporty Soccer",      img: "https://s.sporty.net/common/main/res/6a1e28f108a1a24a780943d36f683967.png",          provider: "SportyGames",  hot: false, cat: "sporty"  },
  { id: "c015", name: "Sporty Lucky Goal",  img: "https://s.sporty.net/common/main/res/bcb8945eb76155757bdad51c29912816.png",          provider: "SportyGames",  hot: false, cat: "sporty"  },
  { id: "c016", name: "SportyBet Sporty6",  img: "https://s.sporty.net/common/main/res/f1fe8e21888f1a9cd75749829afa27e0.png",          provider: "SportyGames",  hot: false, cat: "sporty"  },
  { id: "c017", name: "Goal",               img: "https://s.sporty.net/sportygames/lobby_banner/1648540376516.png",                    provider: "Turbo Games",  hot: false, cat: "sporty"  },
  { id: "c018", name: "Dice",               img: "https://s.sporty.net/sportygames/lobby_banner/1648540432033.png",                    provider: "Turbo Games",  hot: false, cat: "sporty"  },
  { id: "c019", name: "Plinko",             img: "https://s.sporty.net/sportygames/lobby_banner/1648540347199.png",                    provider: "Turbo Games",  hot: false, cat: "sporty"  },
  { id: "c020", name: "Mines",              img: "https://s.sporty.net/sportygames/lobby_banner/1648540320127.png",                    provider: "Turbo Games",  hot: false, cat: "sporty"  },
  { id: "c021", name: "Sporty Keno",        img: "https://s.sporty.net/common/main/res/46ece3af4d85cff4ef80f4d86530108e.png",          provider: "SportyGames",  hot: false, cat: "numbers" },
  { id: "c022", name: "Turbo Keno",         img: "https://s.sporty.net/sportygames/lobby_banner/1648540266057.png",                    provider: "Turbo Games",  hot: false, cat: "numbers" },
  { id: "c023", name: "Flip da' Coin",      img: "https://s.sporty.net/common/main/res/f3b49680d2856abd798c1b1e250bd694.png",          provider: "SportyGames",  hot: false, cat: "numbers" },
  { id: "c024", name: "Spin Da' Bottle",    img: "https://s.sporty.net/common/main/res/1fb1f9ff6d8417c80ebc28cef92bf970.png",          provider: "SportyGames",  hot: false, cat: "numbers" },
  { id: "c025", name: "Red-Black",          img: "https://s.sporty.net/common/main/res/f9b5f1e24b0dc17d8799444dabe5e64a.png",          provider: "SportyGames",  hot: false, cat: "numbers" },
  { id: "c026", name: "Even Odd",           img: "https://s.sporty.net/common/main/res/8519527ffb72789a3c12cccd14d42df3.png",          provider: "SportyGames",  hot: false, cat: "numbers" },
  { id: "c027", name: "Spin2Win",           img: "https://s.sporty.net/common/main/res/c06e43c4253d1430260607f8f0e815c2.png",          provider: "SportyGames",  hot: false, cat: "numbers" },
];

const VIRTUAL_SPORTS = [
  { id: "v001", name: "Instant Virtuals",    img: "https://s.sporty.net/ke/main/res/20259a083389d1c732a19b81a86ed363.png", desc: "Every 3 minutes",  badge: "LIVE" },
  { id: "v002", name: "Sporty SIM",          img: "https://s.sporty.net/cms/SIM_f35ab52fe3.png",                          desc: "Simulated league", badge: "LIVE" },
  { id: "v003", name: "vFootball",           img: "https://s.sporty.net/cms/v_Football_3e1a145b06.png",                   desc: "Every 4 minutes",  badge: "LIVE" },
  { id: "v004", name: "Golden Virtuals",     img: "https://s.sporty.net/ke/main/res/a9ec8f26dcccd14b136ec0c56ed1f782.png",desc: "Multiple sports",  badge: "LIVE" },
  { id: "v005", name: "Scheduled Virtuals",  img: "https://s.sporty.net/ke/main/res/5724bedc1f3ce90aeb5e9fc0dfb0f67d.png",desc: "Fixed schedule",   badge: "UPCOMING" },
];

const VIRTUAL_ENTRANCE = [
  { id: "ve001", name: "Instant Football",   img: "https://s.sporty.net/ke/main/res/20259a083389d1c732a19b81a86ed363.png", label: "popular", size: "Large", icon: "⚽" },
  { id: "ve002", name: "Instant World Cup",  img: "https://s.sporty.net/cms/instant_world_cup_911f3fe436.png",            label: "new",     size: "Small", icon: "🏆" },
  { id: "ve003", name: "vFootball",          img: "https://s.sporty.net/cms/v_Football_3e1a145b06.png",                   label: "popular", size: "Small", icon: "⚽" },
  { id: "ve004", name: "Sporty SIM",         img: "https://s.sporty.net/cms/SIM_f35ab52fe3.png",                          label: "instant", size: "Small", icon: "🎮" },
  { id: "ve005", name: "Sporty Legends",     img: null,                                                                   label: "new",     size: "Small", icon: "🌟" },
  { id: "ve006", name: "Sporty Penalty",     img: null,                                                                   label: "new",     size: "Small", icon: "🥅" },
  { id: "ve007", name: "Sporty African Cup", img: null,                                                                   label: "new",     size: "Small", icon: "🌍" },
  { id: "ve008", name: "Instant Basketball", img: null,                                                                   label: "popular", size: "Small", icon: "🏀" },
  { id: "ve009", name: "Instant Dog Racing", img: null,                                                                   label: "new",     size: "Small", icon: "🐕" },
  { id: "ve010", name: "Golden Virtuals",    img: "https://s.sporty.net/ke/main/res/a9ec8f26dcccd14b136ec0c56ed1f782.png",label: null,      size: "Small", icon: "🏅" },
  { id: "ve011", name: "Scheduled Virtuals", img: "https://s.sporty.net/ke/main/res/5724bedc1f3ce90aeb5e9fc0dfb0f67d.png",label: null,      size: "Small", icon: "📅" },
  { id: "ve012", name: "Live Betting",       img: null,                                                                   label: null,      size: "Small", icon: "🔴" },
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
