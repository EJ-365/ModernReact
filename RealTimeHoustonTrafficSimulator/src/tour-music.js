/**
 * Tour Houston music — one global shuffle pool (all styles mixed).
 * YouTube IFrame + quiet Web Audio bed if a video won't embed.
 * Floating panel, or embedded into the driver dash.
 */

const TRACKS = [
  /* Verified embeddable (YouTube oEmbed) — Oct 2026 refresh */
  { g: 'afrobeat', id: 'CQLsdm1ZYAw', title: 'Calm Down' },
  { g: 'afrobeat', id: 'fX2R7gkQhyg', title: 'Met You', a: 'Carter Efe ft. Taylor Jasmine' },
  { g: 'afrobeat', id: 'Ra1yHDcJygY', title: 'you', a: 'FOLA' },
  { g: 'afrobeat', id: 'xRiw_5aBEjM', title: "it's over", a: 'FOLA, Bella Shmurda, Zlatan' },
  { g: 'afrobeat', id: 'JsS7DPlED7g', title: 'treat u right', a: 'FOLA, Ayra Starr' },
  { g: 'afrobeat', id: 'KJXn2aoRJd8', title: 'who does that?', a: 'FOLA ft. Bella Shmurda' },
  { g: 'afrobeat', id: '-nCnj-edeTE', title: 'Lost', a: 'FOLA, Kizz Daniel' },
  { g: 'afrobeat', id: 'bLQXZFdVglQ', title: 'Very Soon', a: 'BNXN, FOLA' },
  { g: 'afrobeat', id: 'jipQpjUA_o8', title: 'Essence' },
  { g: 'afrobeat', id: 'D-YDEyuDxWU', title: 'Love Nwantiti' },
  { g: 'afrobeat', id: 'lPe09eE6Xio', title: 'Ye' },
  { g: 'afrobeat', id: 'pekzpzNCNDQ', title: 'Peru' },
  { g: 'afrobeat', id: 'crtQSTYWtqE', title: 'Rush' },
  { g: 'afrobeat', id: '3Iyuym-Gci0', title: 'Fall' },
  { g: 'afrobeat', id: '1VrWaED18_g', title: 'Soco' },
  { g: 'afrobeat', id: 'XoiOOiuH8iI', title: 'Water' },
  { g: 'afrobeat', id: 'bbVZo4Yw7pI', title: 'Lonely At The Top' },
  { g: 'afrobeat', id: 'Q7QiLceJSLQ', title: 'Ojuelegba' },
  { g: 'afrobeat', id: 'fXl5dPuiJa0', title: 'Joha' },
  { g: 'pop', id: 'fHI8X4OXluQ', title: 'The Weeknd - Blinding Lights' },
  { g: 'pop', id: 'mRD0-GxqHVo', title: 'Glass Animals - Heat Waves' },
  { g: 'pop', id: 'JRfuAukYTKg', title: 'David Guetta - Titanium ft. Sia' },
  { g: 'pop', id: 'QYh6mYIJG2Y', title: 'Ariana Grande - 7 rings' },
  { g: 'pop', id: 'SlPhMPnQ58k', title: 'Maroon 5 - Memories' },
  { g: 'pop', id: 'k2qgadSvNyU', title: 'Dua Lipa - New Rules' },
  { g: 'hiphop', id: 'U9BwWKXjVaI', title: 'Drake - Nice For What' },
  { g: 'hiphop', id: '_Yhyp-_hX2s', title: 'Eminem - Lose Yourself' },
  { g: 'hiphop', id: 'rywUS-ohqeE', title: 'Alicia Keys - No One' },
  { g: 'hiphop', id: '8UFIYGkROII', title: 'Soulja Boy Tell’em - Crank That (Soulja Boy)' },
  { g: 'hiphop', id: 'eJO5HU_7_1w', title: 'Eminem - The Real Slim Shady' },
  { g: 'rock', id: 'YlUKcNNmywk', title: 'Red Hot Chili Peppers - Californication [HD UPG' },
  { g: 'rock', id: 'v2AC41dglnM', title: 'AC/DC - Thunderstruck' },
  { g: 'rock', id: '6Ejga4kJUts', title: 'The Cranberries - Zombie' },
  { g: 'latin', id: 'DiItGE3eAyQ', title: 'Daddy Yankee & Snow - Con Calma' },
  { g: 'electronic', id: '5dbEhBKGOtY', title: 'David Guetta - Play Hard ft. Ne-Yo, Akon' },
  { g: 'electronic', id: 'UtF6Jej8yb4', title: 'Avicii - The Nights' },
  { g: 'electronic', id: '6Cp6mKbRTQY', title: 'Avicii - Hey Brother' },
  { g: 'electronic', id: 'cHHLHGNpCSA', title: 'Avicii - Waiting For Love' },
  { g: 'electronic', id: 'D5drYkLiLI8', title: 'Kygo & Selena Gomez - It Ain\'t Me' },
  { g: 'electronic', id: 'BgfcToAjfdc', title: 'Kygo - Stole The Show ft. Parson James' },
  { g: 'electronic', id: 'e2vBLd5Egnk', title: 'Martin Garrix & Dua Lipa - Scared To Be Lonely' },
  { g: 'electronic', id: 'M3mJkSqZbX4', title: 'Zedd, Maren Morris, Grey - The Middle' },
  { g: 'electronic', id: 'kOkQ4T5WO9E', title: 'Calvin Harris, Rihanna - This Is What You Came For' },
  { g: 'electronic', id: 'wJnBTPUQS5A', title: 'Alan Walker - The Spectre' },
  { g: 'electronic', id: 'ixkoVwKQaJg', title: 'DJ Snake - Taki Taki ft. Selena Gomez, Ozuna, Cardi B' },
  { g: 'electronic', id: 'jzD_yyEcp0M', title: 'Marshmello & Anne-Marie - FRIENDS' },
  { g: 'electronic', id: 'FM7MFYoylVs', title: 'The Chainsmokers & Coldplay - Something Just Like This' },
  { g: 'electronic', id: 'm-M1AtrxztU', title: 'Clean Bandit - Rather Be ft. Jess Glynne' },
  { g: 'electronic', id: 'nCg3ufihKyU', title: 'Tiësto - The Business' },
  { g: 'electronic', id: '5NV6Rdv1a3I', title: 'Daft Punk - Get Lucky ft. Pharrell Williams' },
  { g: 'country', id: 'lydBPm2KRaU', title: 'Carrie Underwood - Jesus, Take The Wheel' },
  { g: 'gospel', id: 'fd24fpsF1Qw', title: 'CeCe Winans - Believe For It' },
  { g: 'gospel', id: 'OP-00EwLdiU', title: 'Oceans (Where Feet May Fail) - Hillsong UNITED - Live in Israel' },
  { g: 'gospel', id: 'sIaT8Jl2zpI', title: 'Lauren Daigle - You Say' },
  { g: 'gospel', id: 'qtvQNzPHn-w', title: 'Phil Wickham - Battle Belongs' },
  { g: 'gospel', id: 'CqybaIesbuA', title: 'Chris Tomlin - Good Good Father' },
  { g: 'gospel', id: 'TWrGjzBheno', title: 'Marvin Sapp - Never Would Have Made It' },
  { g: 'gospel', id: 'p4rRCjrAyCs', title: 'Tauren Wells - Hills and Valleys' },
  { g: 'gospel', id: 'JGYjKR69M6U', title: 'Zach Williams - Chain Breaker' },
  { g: 'gospel', id: '1yBzIt_z8oY', title: 'Casting Crowns - Nobody ft. Matthew West' },
  { g: 'gospel', id: 'Q5cPQg3oq-o', title: 'for KING + COUNTRY - God Only Knows' },
  { g: 'gospel', id: 'YA2Lxfw4SSw', title: 'MOSES BLISS - TOO FAITHFUL' },
  { g: 'gospel', id: 'gqIwEbCyxBo', title: 'Fragrance To Fire - Dunsin Oyekan' },
  { g: 'gospel', id: 'FYMjO9mL0Tw', title: 'Housefires - Build My Life (feat. Pat Barrett)' },
  { g: 'pop', id: 'Oa_RSwwpPaA', title: 'Benson Boone - Beautiful Things' },
  { g: 'pop', id: '9gWIIIr2Asw', title: 'Teddy Swims - Lose Control' },
  { g: 'pop', id: 'U_Lz_MG35hM', title: 'Chappell Roan - Good Luck, Babe!' },
  { g: 'pop', id: 'adLGHcj_fmA', title: 'Bruno Mars, Anderson .Paak, Silk Sonic - Leave the Door Open' },
  { g: 'pop', id: 'tQ0yjYUFKAE', title: 'Justin Bieber - Peaches ft. Daniel Caesar, Giveon' },
  { g: 'hiphop', id: 'EOxj2ROIxok', title: 'Megan Thee Stallion - Savage' },
  { g: 'hiphop', id: 'DmWWqogr_r8', title: '21 Savage - a lot ft. J. Cole' },
  { g: 'afrobeat', id: 'OSBan_sH_b8', title: 'Davido - UNAVAILABLE ft. Musa Keys' },
  { g: 'country', id: 'IBLruNfUqUs', title: 'Chris Stapleton - Tennessee Whiskey' },
  { g: 'latin', id: 'CocEMWdc7Ck', title: 'SHAKIRA // BZRP Music Sessions #53/66' },
  { g: 'electronic', id: 'DkeiKbqa02g', title: 'Calvin Harris, Dua Lipa - One Kiss' },
  { g: 'rock', id: 'dvgZkm1xWPE', title: 'Coldplay - Viva La Vida' },
  { g: 'gospel', id: 'VH3f0ellNv8', title: 'Travis Greene - Intentional' },
  { g: 'gospel', id: 'SiycqP-kCKE', title: 'Jonathan McReynolds - Make Room' },
  { g: 'gospel', id: '80Dpek7qK08', title: 'Tye Tribbett - If He Did It Before....Same God' },
  { g: 'gospel', id: 'qD--wxM5HZY', title: 'Fred Hammond & RFC - No Weapon' },
  { g: 'gospel', id: 'l65oEJOXx9Y', title: 'I Give Myself Away - William McDowell' },
  { g: 'gospel', id: 'OwrE0YjfNGg', title: 'Koryn Hawthorne - Won’t He Do It' },
  { g: 'gospel', id: 'i58IH2D8sWQ', title: 'Lecrae - Blessings ft. Ty Dolla $ign' },
  { g: 'gospel', id: 'qtnwI127xXQ', title: 'ADA EHI - THE FAITHFUL GOD' },
  { g: 'gospel', id: '_2xKfhSI_IQ', title: 'Frank Edwards - Under The Canopy' },
  { g: 'gospel', id: 'bhZKHBIPYPA', title: 'Tim Godfrey ft Travis Greene - Nara' },
  { g: 'gospel', id: 'V7eZD3TKn_M', title: 'Mary Mary - Shackles (Praise You)' },
  { g: 'pop', id: 'pok8H_KF1FA', title: 'Doja Cat - Say So' },
  { g: 'pop', id: 'QGJuMBdaqIw', title: 'Katy Perry - Firework' },
  { g: 'afrobeat', id: 'WcIcVapfqXw', title: 'Rema, Selena Gomez - Calm Down' },
  { g: 'electronic', id: 'm7Bc3pLyij0', title: 'Marshmello ft. Bastille - Happier' },
  { g: 'electronic', id: '0zGcUoRlhmw', title: 'The Chainsmokers - Closer ft. Halsey' },
  { g: 'rock', id: 'VcjzHMhBtf0', title: 'Journey - Don’t Stop Believin’' },
  { g: 'classics', id: 'eH3giaIzONA', title: 'Whitney Houston - I Wanna Dance With Somebody (Who Loves Me)' },
  { g: 'classics', id: 'Gs069dndIYk', title: 'Earth, Wind & Fire - September' },
  { g: 'gospel', id: 'QM8jQHE5AAk', title: 'Way Maker' },
  { g: 'gospel', id: '6xx0d3R2LoU', title: 'Reckless Love' },
  { g: 'gospel', id: 'n0FBb6hnwTo', title: 'Goodness of God' },
  { g: 'gospel', id: 'Y-4NFvI5U9w', title: 'Amazing Grace (My Chains Are Gone)' },
  { g: 'gospel', id: 'XtwIT8JjddM', title: '10,000 Reasons' },
  { g: 'gospel', id: 'KBD18rsVJHk', title: 'How Great Is Our God' },
  { g: 'gospel', id: 'mC-zw0zCCtg', title: 'Jireh' },
  { g: 'gospel', id: 'KwX1f2gYKZ4', title: 'Graves Into Gardens' },
  { g: 'gospel', id: '3aD8OK07iIY', title: 'Love Theory' },
  { g: 'gospel', id: 'ucY6NwQTI3M', title: 'Break Every Chain' },
  { g: 'gospel', id: 'qlsQrycKKsY', title: 'Good Good Father' },
  { g: 'gospel', id: 'N_lrrq_opng', title: 'I Can Only Imagine' },
  { g: 'pop', id: 'eVli-tstM5E', title: 'Espresso' },
  { g: 'pop', id: 'V9PVRfjEBTI', title: 'Birds of a Feather' },
  { g: 'pop', id: 'suAR1PYFNYA', title: 'Houdini' },
  { g: 'pop', id: 'ic8j13piAhQ', title: 'Cruel Summer' },
  { g: 'pop', id: 'RlPNh_PBZb4', title: 'vampire' },
  { g: 'pop', id: 'E07s5ZYygMg', title: 'Watermelon Sugar' },
  { g: 'pop', id: 'XXYlFuWEuKI', title: 'Save Your Tears' },
  { g: 'pop', id: 'kPa7bsKwL-c', title: 'Die With A Smile' },
  { g: 'pop', id: 'ekr2nIex040', title: 'APT.' },
  { g: 'pop', id: 'q0hyYWKXF0Q', title: 'Dance Monkey' },
  { g: 'pop', id: 'orJSJGHjBLI', title: 'Bad Habits' },
  { g: 'pop', id: 'lY2yjAdbvdQ', title: 'Treat You Better' },
  { g: 'pop', id: 'ZbZSe6N_BXs', title: 'Happy' },
  { g: 'hiphop', id: 'H58vbez_m4E', title: 'Not Like Us' },
  { g: 'hiphop', id: '6ONRf7h3Mdk', title: 'SICKO MODE' },
  { g: 'hiphop', id: 'vBk30V8AukM', title: 'Solar Eclipse', a: 'Drake, Don Toliver' },
  { g: 'hiphop', id: 'tvTRZJ-4EyI', title: 'HUMBLE.' },
  { g: 'hiphop', id: 'xFYQQPAOz7Y', title: 'Lose Yourself' },
  { g: 'hiphop', id: 'xvZqHgFz51I', title: 'Mask Off' },
  { g: 'hiphop', id: 'PEGccV-NOm8', title: 'Bodak Yellow' },
  { g: 'hiphop', id: 'yQBImEeXNZ4', title: 'FIRST CLASS' },
  { g: 'hiphop', id: 'UceaB4D0jpo', title: 'Rockstar' },
  { g: 'hiphop', id: '7ZAYzLjQAd4', title: 'Still Tippin\'' },
  { g: 'country', id: 'bUjPPBxbQrQ', title: 'Last Night' },
  { g: 'country', id: 'hLOheGDwD_0', title: "Choosin' Texas", a: 'Ella Langley' },
  { g: 'country', id: 'Fr7oYjnt3bM', title: 'Fast Car' },
  { g: 'country', id: 'ZVVvJjwzl6c', title: 'I Remember Everything' },
  { g: 'country', id: '4zAThXFOy2c', title: 'Tennessee Whiskey' },
  { g: 'country', id: 't7bQwwqW-Hc', title: 'A Bar Song (Tipsy)' },
  { g: 'country', id: '238Z4YaAr1g', title: 'TEXAS HOLD \'EM' },
  { g: 'country', id: 'wtVeDaZxAXo', title: 'Amarillo By Morning' },
  { g: 'country', id: 'WaSy8yy-mr8', title: 'Before He Cheats' },
  { g: 'country', id: '8PvebsWcpto', title: 'Cruise' },
  { g: 'country', id: 'Lb9q1ScC4cg', title: 'Dirt Road Anthem' },
  { g: 'country', id: 'e4ujS1er1r0', title: 'Chicken Fried' },
  { g: 'country', id: 'Mdh2p03cRfw', title: 'Body Like a Back Road' },
  { g: 'country', id: 'dRX0wDNK6S4', title: 'Heaven' },
  { g: 'country', id: 'eM213aMKTHg', title: 'Need You Now' },
  { g: 'rock', id: 'gOsM-DYAEhY', title: 'Whatever It Takes' },
  { g: 'rock', id: '0I647GU3Jsc', title: 'Natural' },
  { g: 'rock', id: 'D9G1VOjN_84', title: 'Enemy' },
  { g: 'rock', id: 'F90Cw4l-8NY', title: 'Pompeii' },
  { g: 'electronic', id: '_ovdm2yX4MA', title: 'Levels' },
  /* Pop / mainstream */
  { g: 'pop', id: 'kJQP7kiw5Fk', title: 'Despacito' },
  { g: 'pop', id: 'OPf0YbXqDm0', title: 'Uptown Funk' },
  { g: 'pop', id: 'fRh_vgS2dFE', title: 'Sorry' },
  { g: 'pop', id: 'CevxZvSJLk8', title: 'Roar' },
  { g: 'pop', id: 'YQHsXMglC9A', title: 'Hello' },
  { g: 'pop', id: '2Vv-BfVoq4g', title: 'Perfect' },
  { g: 'pop', id: 'JGwWNGJdvx8', title: 'Shape of You' },
  { g: 'pop', id: '09R8_2nJtjg', title: 'Sugar' },
  { g: 'pop', id: 'e-ORhEE9VVg', title: 'Blank Space' },
  { g: 'pop', id: 'nfWlot6h_JM', title: 'Shake It Off' },
  { g: 'pop', id: '4NRXx6U8ABQ', title: 'Blinding Lights' },
  { g: 'pop', id: 'G7KNmW9a75Y', title: 'Flowers' },
  { g: 'pop', id: 'kTJczUoc26U', title: 'STAY' },
  { g: 'pop', id: 'gdZLi9oWNZg', title: 'Dynamite' },
  { g: 'pop', id: 'Pkh8UtuejGw', title: 'Señorita' },
  { g: 'pop', id: 'HZwMX6T5Jhk', title: 'Havana' },
  { g: 'pop', id: 'TUVcZfQe-Kw', title: 'Levitating' },
  { g: 'pop', id: 'b1kbLwvqugk', title: 'Anti-Hero' },
  { g: 'pop', id: 'H5v3kku4y6Q', title: 'As It Was' },
  { g: 'pop', id: 'U3ASj1L6_sY', title: 'Easy On Me' },
  { g: 'pop', id: '3tmd-ClpJxA', title: 'Closer' },
  { g: 'pop', id: '8EJ3zbKTWQ8', title: 'New Rules' },
  { g: 'pop', id: 'aJOTlE1K90k', title: 'Girls Like You' },
  { g: 'pop', id: 'lp-EO5I60KA', title: 'Thinking Out Loud' },
  { g: 'pop', id: '0KSOMA3QBU0', title: 'Dark Horse' },
  { g: 'pop', id: 'QJO3ROT-A4E', title: 'What Makes You Beautiful' },
  { g: 'pop', id: 'RgKAFK5djSk', title: 'See You Again' },
  { g: 'pop', id: 'CevxZvSJLk8', title: 'Roar' },
  { g: 'pop', id: 'hT_nvWreIhg', title: 'Counting Stars' },
  { g: 'pop', id: 'YykjpeuMNEk', title: 'Hymn for the Weekend' },
  { g: 'pop', id: 'PT2_F-1esPk', title: 'The Middle' },
  { g: 'pop', id: 'nYh-n7EOtMA', title: 'Cheap Thrills' },
  { g: 'pop', id: 'DyDfgMOUjCI', title: 'bad guy' },
  { g: 'pop', id: 'ZmDBbnmKpqQ', title: 'drivers license' },
  { g: 'pop', id: '5anLPw0Efmo', title: 'Bones' },
  /* Hip-hop / R&B */
  { g: 'hiphop', id: 'uelHwf8o7_U', title: 'Love The Way You Lie' },
  { g: 'hiphop', id: 'j5-yKhDd64s', title: 'Not Afraid' },
  { g: 'hiphop', id: 'XbGs_qK2PQA', title: 'Rap God' },
  { g: 'hiphop', id: 'xpVfcZ0ZcFM', title: "God's Plan" },
  { g: 'hiphop', id: 'uxpDa-c-4Mc', title: 'Hotline Bling' },
  { g: 'hiphop', id: 'QK8mJJJvaes', title: 'Sicko Mode' },
  { g: 'hiphop', id: 'gCYcHz2k5x0', title: 'HUMBLE.' },
  { g: 'hiphop', id: 'E5yFcdPAGv0', title: 'In My Feelings' },
  { g: 'hiphop', id: 'LsoLEjrDogU', title: "That's What I Like" },
  { g: 'hiphop', id: 'r7qovpFAGrQ', title: 'Old Town Road' },
  { g: 'hiphop', id: 'ApXoWvfEYVU', title: 'Sunflower' },
  { g: 'hiphop', id: 'wXhTHyIgQ_U', title: 'Circles' },
  { g: 'hiphop', id: 'ru0K8uYEZWw', title: "Can't Feel My Face" },
  { g: 'hiphop', id: 'PIh2xe4jnpk', title: 'Adorn' },
  { g: 'hiphop', id: 'U0CGsw6h60k', title: 'Earned It' },
  { g: 'hiphop', id: 'yzTuBuRdAyA', title: 'No Guidance' },
  { g: 'hiphop', id: 'Zi_XLOBDo_Y', title: 'Billie Jean' },
  { g: 'hiphop', id: 'sOnqjkJTMaA', title: 'Thriller' },
  { g: 'hiphop', id: '450p7goxZqg', title: 'All of Me' },
  { g: 'hiphop', id: 'rYEDA3JcQqw', title: 'Rolling in the Deep' },
  { g: 'hiphop', id: 'hLQl3WQQoQ0', title: 'Someone Like You' },
  { g: 'hiphop', id: 'EPo5wWmKEaI', title: 'Photograph' },
  { g: 'hiphop', id: 'VuNIsY6JdUw', title: "Say You Won't Let Go" },
  { g: 'hiphop', id: '3AtDnEC4zak', title: "We Don't Talk Anymore" },
  /* Rock / alt */
  { g: 'rock', id: 'hTWKbfoikeg', title: 'Smells Like Teen Spirit' },
  { g: 'rock', id: 'fJ9rUzIMcZQ', title: 'Bohemian Rhapsody' },
  { g: 'rock', id: 'kXYiU_JCYtU', title: 'Numb' },
  { g: 'rock', id: 'eVTXPUF4Oz4', title: 'In the End' },
  { g: 'rock', id: '7wtfhZwyrcc', title: 'Believer' },
  { g: 'rock', id: 'fKopy74weus', title: 'Demons' },
  { g: 'rock', id: 'ktvTqknDobU', title: 'Centuries' },
  { g: 'rock', id: '1w7OgIMMRc4', title: 'Sweet Child O Mine' },
  { g: 'rock', id: 'tAGnKpE4NCI', title: 'Something Just Like This' },
  { g: 'rock', id: 'SBjQ9tuuTJQ', title: 'Eye of the Tiger' },
  { g: 'rock', id: 'pXRviuL6vMY', title: 'Stressed Out' },
  { g: 'rock', id: 'Pw-0pbY9JeU', title: 'Ride' },
  { g: 'rock', id: '1G4isv_Fylg', title: 'Paradise' },
  /* Electronic / dance */
  { g: 'electronic', id: '60ItHLz5WEA', title: 'Faded' },
  { g: 'electronic', id: 'IcrbM1l_BoI', title: 'Wake Me Up' },
  { g: 'electronic', id: 'YqeW9_5kURI', title: 'Lean On' },
  { g: 'electronic', id: 'hHUbLv4ThOo', title: 'Clarity' },
  { g: 'electronic', id: '9bZkp7q19f0', title: 'Gentleman' },
  { g: 'electronic', id: 'YVkUvmDQ3HY', title: 'Gangnam Style' },
  /* Latin / global */
  { g: 'latin', id: 'pRpeEdMmmQ0', title: 'Waka Waka' },
  { g: 'latin', id: 'NUsoVlDFqZg', title: 'Mi Gente' },
  { g: 'latin', id: 'WNIPqafd4As', title: 'Danza Kuduro' },
  { g: 'latin', id: '9jI-z9QN6g8', title: 'Gasolina' },
  { g: 'latin', id: '7F37r50VUTQ', title: 'Tusa' },
  { g: 'latin', id: 'dQw4w9WgXcQ', title: 'Never Gonna Give You Up' },
  { g: 'latin', id: 'QaXhVryxVBk', title: 'Bichota' },
  { g: 'latin', id: 'fJ9rUzIMcZQ', title: 'Bohemian Rhapsody' },
  /* Afrobeat */
  { g: 'afrobeat', id: '421w1j87fEM', title: 'Last Last' },
  { g: 'afrobeat', id: 'Ecl8Aod0Tl0', title: 'On The Low' },
  { g: 'afrobeat', id: 'FCUk7rIBBAE', title: 'Joro' },
  { g: 'afrobeat', id: 'zUU1bIWpH5c', title: 'Dumebi' },
  { g: 'afrobeat', id: 'bLF90M96m2Q', title: 'Buga' },
  { g: 'afrobeat', id: 'qrIP_igi76U', title: 'Terminator' },
  { g: 'afrobeat', id: 'k6eE3c70hgg', title: 'Soso' },
  { g: 'afrobeat', id: 'dNt1QR1ecuM', title: 'Charm' },
  { g: 'afrobeat', id: 'MqqBH9Fa4NQ', title: 'Asiwaju' },
  { g: 'afrobeat', id: 'hLDQ88vAhIs', title: 'City Boys' },
  { g: 'afrobeat', id: 'GoWGGiWDsac', title: 'Feel' },
  { g: 'afrobeat', id: 'vqW18C4plZ8', title: 'Come Closer' },
  { g: 'afrobeat', id: 'v15sS1sL_S4', title: 'Leg Over' },
  { g: 'afrobeat', id: '5goMslKxEWs', title: 'Koroba' },
  { g: 'afrobeat', id: 'gCLUIzOsgGg', title: 'Bandana' },
  { g: 'afrobeat', id: '546V71zODtk', title: 'Elon Musk' },
  { g: 'afrobeat', id: 'UzswywOA1qU', title: 'Ozeba' },
  { g: 'afrobeat', id: 'so4dgTRaWFk', title: 'Anybody' },
  { g: 'afrobeat', id: 'E3E8qQmP4t8', title: 'Holy Ghost' },
  { g: 'afrobeat', id: 'DPBRGWUgQsA', title: 'Soweto' },
  { g: 'afrobeat', id: 'helEv0kGHd4', title: 'If' },
  { g: 'afrobeat', id: '5A-CjKOQWvg', title: 'Sungba' },
  { g: 'afrobeat', id: 'EhyzYPSHRQU', title: 'Commas' },
  { g: 'afrobeat', id: 'Y_NTooezadU', title: 'Love Me JeJe' },
  { g: 'afrobeat', id: 'nl0oB5IbBOA', title: 'HEHEHE' },
  { g: 'afrobeat', id: '041PlAGNMsQ', title: 'Twe Twe' },
  { g: 'afrobeat', id: 'UEcAPvoSe_8', title: 'Sip (Alcohol)' },
  { g: 'afrobeat', id: 'YSy2lBZ1QrA', title: 'Ginger' },
  { g: 'afrobeat', id: 'eKv5CBr-kKo', title: 'Kilometre' },
  { g: 'afrobeat', id: 'GIDiI5kyBDQ', title: 'Kwaku the Traveller' },
  { g: 'afrobeat', id: 'ucVJrja8r6Q', title: 'Assurance' },
  { g: 'afrobeat', id: 'nrTkERuwdCc', title: 'Soundgasm' },
  { g: 'afrobeat', id: 'CZc3pU_XEXw', title: 'Different Patterns' },
  { g: 'afrobeat', id: '6WkxiF7nnjY', title: 'Rock' },
  { g: 'afrobeat', id: 'UKpz-I9EV84', title: 'Truth or Dare' },
  { g: 'afrobeat', id: 'l_-v1fNdSHs', title: 'Amapiano' },
  { g: 'afrobeat', id: '8560CAdA0Ys', title: 'Common Person' },
  { g: 'afrobeat', id: 'NCyOpHmh0mA', title: 'Forgiveness' },
  { g: 'afrobeat', id: 'FfHSi48IY4g', title: 'All Of Us (Ashawo)' },
  /* Gospel / worship */
  { g: 'gospel', id: 'dy9nwe9_xzw', title: 'Oceans (Where Feet May Fail)' },
  { g: 'gospel', id: 'nQWFzMvCfLE', title: 'Build My Life' },
  /* More hits / classics */
  { g: 'classics', id: 'fRh_vgS2dFE', title: 'Sorry' },
  { g: 'classics', id: '09R8_2nJtjg', title: 'Sugar' },
  { g: 'classics', id: 'fLexgOxsZu0', title: 'Uptown Funk (alt)' },
  { g: 'classics', id: 'hT_nvWreIhg', title: 'Counting Stars' },
  { g: 'classics', id: 'YQHsXMglC9A', title: 'Hello' },
  { g: 'classics', id: '450p7goxZqg', title: 'All of Me' },
  { g: 'classics', id: 'RBumgq5yVrA', title: 'Let Her Go' },
  { g: 'classics', id: '1y6smkh6c-0', title: 'Cruise' },
  { g: 'classics', id: '9bZkp7q19f0', title: 'Gentleman' },
  { g: 'classics', id: 'CevxZvSJLk8', title: 'Roar' },
  { g: 'classics', id: 'KQ6zr6kCPj8', title: 'Party Rock Anthem' },
  { g: 'classics', id: 'fWNaR-rxAic', title: 'Call Me Maybe' },
  { g: 'classics', id: 'iS1g8G_njx8', title: 'Titanium' },
  { g: 'classics', id: 'lWA2pjMjpBs', title: 'Rolling in the Deep (live)' },
  { g: 'classics', id: 'ytQ5CYE1VZw', title: 'Royals' },
  { g: 'classics', id: 'hT_nvWreIhg', title: 'Counting Stars' },
  { g: 'classics', id: '2vjPBrBU-TM', title: 'Chandelier' },
  { g: 'classics', id: 'YVkUvmDQ3HY', title: 'Gangnam Style' },
  { g: 'classics', id: 'kXYiU_JCYtU', title: 'Numb' },
  { g: 'classics', id: 'fJ9rUzIMcZQ', title: 'Bohemian Rhapsody' },
  { g: 'classics', id: 'eVTXPUF4Oz4', title: 'In the End' },
  { g: 'classics', id: '7wtfhZwyrcc', title: 'Believer' },
  { g: 'classics', id: 'fKopy74weus', title: 'Demons' },
  { g: 'classics', id: 'pXRviuL6vMY', title: 'Stressed Out' },
  { g: 'classics', id: 'Pw-0pbY9JeU', title: 'Ride' },
  { g: 'classics', id: '60ItHLz5WEA', title: 'Faded' },
  { g: 'classics', id: 'IcrbM1l_BoI', title: 'Wake Me Up' },
  { g: 'classics', id: 'kJQP7kiw5Fk', title: 'Despacito' },
  { g: 'classics', id: 'OPf0YbXqDm0', title: 'Uptown Funk' },
  { g: 'classics', id: '4NRXx6U8ABQ', title: 'Blinding Lights' },
  { g: 'classics', id: 'G7KNmW9a75Y', title: 'Flowers' },
  { g: 'classics', id: 'JGwWNGJdvx8', title: 'Shape of You' },
  { g: 'classics', id: '2Vv-BfVoq4g', title: 'Perfect' },
  { g: 'classics', id: 'xpVfcZ0ZcFM', title: "God's Plan" },
  { g: 'classics', id: 'gCYcHz2k5x0', title: 'HUMBLE.' },
  { g: 'classics', id: 'ApXoWvfEYVU', title: 'Sunflower' },
  { g: 'classics', id: 'dy9nwe9_xzw', title: 'Oceans' },
  { g: 'classics', id: 'hTWKbfoikeg', title: 'Smells Like Teen Spirit' },
  { g: 'classics', id: '1w7OgIMMRc4', title: 'Sweet Child O Mine' },
  { g: 'classics', id: 'SBjQ9tuuTJQ', title: 'Eye of the Tiger' },
  { g: 'classics', id: 'Zi_XLOBDo_Y', title: 'Billie Jean' },
  { g: 'classics', id: 'sOnqjkJTMaA', title: 'Thriller' },
  { g: 'classics', id: 'XbGs_qK2PQA', title: 'Rap God' },
  { g: 'classics', id: 'j5-yKhDd64s', title: 'Not Afraid' },
  { g: 'classics', id: 'uelHwf8o7_U', title: 'Love The Way You Lie' },
  { g: 'classics', id: 'NUsoVlDFqZg', title: 'Mi Gente' },
  { g: 'classics', id: 'WNIPqafd4As', title: 'Danza Kuduro' },
  { g: 'classics', id: '9jI-z9QN6g8', title: 'Gasolina' },
  { g: 'classics', id: 'QaXhVryxVBk', title: 'Bichota' },
  { g: 'classics', id: '7F37r50VUTQ', title: 'Tusa' },
  { g: 'classics', id: 'pRpeEdMmmQ0', title: 'Waka Waka' },
  { g: 'classics', id: '8xg3vE8Ie_E', title: 'Love Story' },
  { g: 'classics', id: '1cQh1ccqu8M', title: 'Rush' },
  { g: 'classics', id: 'YqeW9_5kURI', title: 'Lean On' },
  { g: 'classics', id: 'KQ6zr6kCPj8', title: 'Party Rock Anthem' },
  { g: 'classics', id: 'fWNaR-rxAic', title: 'Call Me Maybe' },
  { g: 'classics', id: '2vjPBrBU-TM', title: 'Chandelier' },
  { g: 'classics', id: 'ytQ5CYE1VZw', title: 'Royals' },
  { g: 'classics', id: 'iS1g8G_njx8', title: 'Titanium' },
  { g: 'classics', id: 'RgKAFK5djSk', title: 'See You Again' },
  { g: 'classics', id: 'b1kbLwvqugk', title: 'Anti-Hero' },
  { g: 'classics', id: 'H5v3kku4y6Q', title: 'As It Was' },
  { g: 'classics', id: 'kTJczUoc26U', title: 'STAY' },
  { g: 'classics', id: 'gdZLi9oWNZg', title: 'Dynamite' },
  { g: 'classics', id: 'TUVcZfQe-Kw', title: 'Levitating' },
  { g: 'classics', id: 'HZwMX6T5Jhk', title: 'Havana' },
  { g: 'classics', id: 'Pkh8UtuejGw', title: 'Señorita' },
  { g: 'classics', id: 'aJOTlE1K90k', title: 'Girls Like You' },
  { g: 'classics', id: 'e-ORhEE9VVg', title: 'Blank Space' },
  { g: 'classics', id: 'nfWlot6h_JM', title: 'Shake It Off' },
  { g: 'classics', id: 'U3ASj1L6_sY', title: 'Easy On Me' },
  { g: 'classics', id: '3tmd-ClpJxA', title: 'Closer' },
  { g: 'classics', id: '8EJ3zbKTWQ8', title: 'New Rules' },
  { g: 'classics', id: 'nYh-n7EOtMA', title: 'Cheap Thrills' },
  { g: 'classics', id: 'DyDfgMOUjCI', title: 'bad guy' },
  { g: 'classics', id: 'ZmDBbnmKpqQ', title: 'drivers license' },
  { g: 'classics', id: '5anLPw0Efmo', title: 'Bones' },
  { g: 'classics', id: 'YykjpeuMNEk', title: 'Hymn for the Weekend' },
  { g: 'classics', id: 'PT2_F-1esPk', title: 'The Middle' },
  { g: 'classics', id: 'tAGnKpE4NCI', title: 'Something Just Like This' },
  { g: 'classics', id: 'ktvTqknDobU', title: 'Centuries' },
  { g: 'classics', id: '1G4isv_Fylg', title: 'Paradise' },
  { g: 'classics', id: 'r7qovpFAGrQ', title: 'Old Town Road' },
  { g: 'classics', id: 'wXhTHyIgQ_U', title: 'Circles' },
  { g: 'classics', id: 'LsoLEjrDogU', title: "That's What I Like" },
  { g: 'classics', id: 'QK8mJJJvaes', title: 'Sicko Mode' },
  { g: 'classics', id: 'E5yFcdPAGv0', title: 'In My Feelings' },
  { g: 'classics', id: 'uxpDa-c-4Mc', title: 'Hotline Bling' },
  { g: 'classics', id: 'ru0K8uYEZWw', title: "Can't Feel My Face" },
  { g: 'classics', id: 'lp-EO5I60KA', title: 'Thinking Out Loud' },
  { g: 'classics', id: 'rYEDA3JcQqw', title: 'Rolling in the Deep' },
  { g: 'classics', id: 'hLQl3WQQoQ0', title: 'Someone Like You' },
  { g: 'classics', id: 'EPo5wWmKEaI', title: 'Photograph' },
  { g: 'classics', id: 'VuNIsY6JdUw', title: "Say You Won't Let Go" },
  { g: 'classics', id: 'RBumgq5yVrA', title: 'Let Her Go' },
  { g: 'classics', id: '450p7goxZqg', title: 'All of Me' },
  { g: 'classics', id: 'nQWFzMvCfLE', title: 'Build My Life' },
  { g: 'classics', id: 'hHUbLv4ThOo', title: 'Clarity' },
  { g: 'classics', id: 'dQw4w9WgXcQ', title: 'Never Gonna Give You Up' },
  /* Oct 2026 additions: official uploads, oEmbed-verified */
  { g: 'afrobeat', id: 'eKzmRnetw-c', title: 'Higher' },
  { g: 'afrobeat', id: '2mkhevOXVNk', title: 'Bad To Me' },
  { g: 'afrobeat', id: 'mMJ3Gogi2Qk', title: 'Sittin\' On Top Of The World' },
  { g: 'afrobeat', id: 'zcR0PWGfUhs', title: 'Bloody Samaritan' },
  { g: 'afrobeat', id: '1JltlSJH5bY', title: 'Me & U' },
  { g: 'afrobeat', id: '_u4_iWCvZ5c', title: 'Organise' },
  { g: 'afrobeat', id: 'MefXQvGTYtE', title: 'Peace Be Unto You' },
  { g: 'afrobeat', id: 'l6QMJniQWxQ', title: 'Jowo' },
  { g: 'afrobeat', id: 'DqUd72pK15Y', title: 'Godly' },
  { g: 'afrobeat', id: 'YRhBfL3GEjQ', title: 'Vibration' },
  { g: 'afrobeat', id: '4j7Fa2PCMow', title: 'Cough' },
  { g: 'afrobeat', id: 'v7dsnMbRAHY', title: 'Woman' },
  { g: 'afrobeat', id: 'hzFUM5AW1YQ', title: 'Dior' },
  { g: 'afrobeat', id: 'h7WfPHHXCAY', title: 'Gbona' },
  { g: 'afrobeat', id: 'X0YOrxhBoj0', title: 'Pour Me Water' },
  { g: 'afrobeat', id: 'NXSmawBg_6Q', title: 'Somebody\'s Son' },
  { g: 'afrobeat', id: 'C_XkTKoDI18', title: 'Johnny' },
  { g: 'afrobeat', id: 'ttdU19Kwce8', title: 'Personally' },
  { g: 'afrobeat', id: 'lta5go9P-go', title: 'Fem' },
  { g: 'afrobeat', id: 'sqflXTvth3s', title: 'Skelewu' },
  { g: 'afrobeat', id: 'r-Q6UrrxF4U', title: 'Mood' },
  { g: 'afrobeat', id: 'rjeoG7VcOB4', title: 'Basquiat' },
  { g: 'afrobeat', id: 'KYn3k8dpRJI', title: 'Sability' },
  { g: 'afrobeat', id: 'BfIUgmQG9c4', title: 'Chance' },
  { g: 'afrobeat', id: 'eB7Ayp1kOc8', title: 'Declan Rice' },
  { g: 'afrobeat', id: 'fCZVL_8D048', title: 'Jerusalema' },
  { g: 'afrobeat', id: 'xxMTgqNjZGo', title: 'Bounce' },
  { g: 'afrobeat', id: '3bFPDfWReN0', title: 'Kante' },
  { g: 'afrobeat', id: 'n3s6lDf8Nq0', title: 'Jump' },
  { g: 'afrobeat', id: 'Ypr5QN7Xn_M', title: 'Emiliana' },
  { g: 'afrobeat', id: 'pp6xej5xWfs', title: 'Baby' },
  { g: 'afrobeat', id: '-L8hLkg21MQ', title: 'Duduke' },
  { g: 'afrobeat', id: 'HCuTwNgY3_M', title: 'Waah' },
  { g: 'pop', id: 'cF1Na4AIecM', title: 'Please Please Please' },
  { g: 'pop', id: 'MSRcC626prw', title: 'Kill Bill' },
  { g: 'pop', id: 'LDY_XyxBu8A', title: 'Snooze' },
  { g: 'pop', id: 'gNi_6U5Pm_o', title: 'good 4 u' },
  { g: 'pop', id: 'UqyT8IEBkvY', title: '24K Magic' },
  { g: 'pop', id: 'SjqmSPZhF3s', title: 'CUFF IT' },
  { g: 'pop', id: 'm4_9TFeMfJE', title: 'Paint The Town Red' },
  { g: 'hiphop', id: '9TincgwjtmA', title: 'God\'s Plan' },
  { g: 'hiphop', id: 'B9synWjqBn8', title: 'FE!N' },
  { g: 'hiphop', id: 'Dst9gZkq1a8', title: 'goosebumps' },
  { g: 'hiphop', id: '_YzD9KW82sk', title: 'Drip Too Hard' },
  { g: 'hiphop', id: 'SC4xMk98Pdc', title: 'Congratulations' },
  { g: 'hiphop', id: 'XVgCLQ_JQfU', title: 'HISS' },
  { g: 'hiphop', id: '_r-nPqWGG6c', title: 'No Idea' },
  { g: 'hiphop', id: 'wJoU6Vbf-_o', title: 'Sittin\' Sidewayz' },
  { g: 'country', id: 'FjBp30kjzTc', title: 'Whiskey Glasses' },
  { g: 'country', id: 'lA8F9sIhGdg', title: 'Something in the Orange' },
  { g: 'country', id: '4QIZE708gJ4', title: 'I Had Some Help' },
  { g: 'country', id: '7HX4SfnVlP4', title: 'Country Girl' },
  { g: 'country', id: 'P1nRboaLTzU', title: 'Need A Favor' },
  { g: 'country', id: '_3jv0_wGK1M', title: 'Watermelon Moonshine' },
  { g: 'gospel', id: 'Z8SPwT3nQZ8', title: 'I Smile' },
  { g: 'gospel', id: 'yNOw5iBoCd0', title: 'Promises' },
  { g: 'gospel', id: 'SkPa8DJjCBw', title: 'Believe For It' },
  { g: 'gospel', id: 'AzZC3EbH6iE', title: 'Gracefully Broken' },
  { g: 'gospel', id: 'f2oxGYpuLkw', title: 'Praise' },
  { g: 'gospel', id: 'dQdfs5S6jyA', title: 'Gratitude' },
  { g: 'gospel', id: 'frtZ4XfoXxM', title: 'I Know Who I Am' },
  { g: 'gospel', id: 'awexlghI7gM', title: 'Excess Love' },
  { g: 'gospel', id: 'Jx84DLwIII4', title: 'Imela' },
  { g: 'latin', id: 'Cr8K88UcO0s', title: 'Titi Me Pregunto' },
  { g: 'latin', id: 'ca48oMV59LU', title: 'Provenza' },
  { g: 'latin', id: 'lZiaYpD9ZrI', title: 'Ella Baila Sola' },
  { g: 'latin', id: 'DUT5rEU6pqM', title: 'Hips Don\'t Lie' },
  { g: 'latin', id: 'RKGbjJarMeA', title: 'Bidi Bidi Bom Bom' },
  { g: 'electronic', id: 'ebXbLfLACGM', title: 'Summer' },
  { g: 'electronic', id: '9Sc-ir2UwGU', title: 'Firestone' },
  { g: 'electronic', id: 'Cl6Rz1Uvi2M', title: 'Delilah' },
  { g: 'rock', id: 'eBG7P-K-r1Y', title: 'Everlong' },
  { g: 'rock', id: 'bpOSxM0rNPM', title: 'Do I Wanna Know?' },
  { g: 'rock', id: 'gGdGFtwCNBE', title: 'Mr. Brightside' },
  /* movie soundtracks + Like A Prayer (choir version) — official uploads, oEmbed-verified */
  { g: 'movies', id: 'NdzOv1t8Ie4', title: 'Like A Prayer (Choir Version, Deadpool & Wolverine)', artist: 'Madonna' },
  { g: 'movies', id: 'c56t7upa8Bk', title: 'Time (Inception)', artist: 'Hans Zimmer' },
  { g: 'movies', id: 'HV1CMDhemt0', title: 'First Step (Interstellar)', artist: 'Hans Zimmer' },
  { g: 'movies', id: 'siwpn14IE7E', title: 'Danger Zone (Top Gun)', artist: 'Kenny Loggins' },
  { g: 'movies', id: 'btPJPFnesV4', title: 'Eye Of The Tiger (Rocky III)', artist: 'Survivor' },
  { g: 'movies', id: 'CUmOFqQRkco', title: 'My Heart Will Go On (Titanic)', artist: 'Celine Dion' },
  { g: 'movies', id: 'bo_efYhYU2A', title: 'Shallow (A Star Is Born)', artist: 'Lady Gaga & Bradley Cooper' },
  { g: 'movies', id: 'DeumyOzKqgI', title: 'Skyfall', artist: 'Adele' },
  { g: 'movies', id: 'Fe93CLbHjxQ', title: 'Ghostbusters', artist: 'Ray Parker Jr.' },
  { g: 'movies', id: 'CdqoNKCCt7A', title: 'Don\'t You (Forget About Me) (The Breakfast Club)', artist: 'Simple Minds' },
  { g: 'movies', id: 'cW8VLC9nnTo', title: 'What Was I Made For? (Barbie)', artist: 'Billie Eilish' },
  { g: 'movies', id: '-NqaupGcCpw', title: 'Theme from Jurassic Park', artist: 'John Williams' },
  { g: 'movies', id: 'fNFzfwLM72c', title: 'Stayin\' Alive (Saturday Night Fever)', artist: 'Bee Gees' },
  { g: 'movies', id: '8a-HfNE3EIo', title: 'Chariots Of Fire', artist: 'Vangelis' },
  /* Houston artists, 80s anthems, synthwave/cyberpunk, EDM, rock and country — oEmbed-verified */
  /* v10.108: requested hits (Wonder, Inferno, Beez In The Trap) + EDM, synthwave and more — oEmbed-verified, not already listed */
  { g: 'pop', id: 'Kmx9NaeihXw', title: 'Wonder', artist: 'Katy Perry' },
  { g: 'afrobeat', id: 'cKx9TeXMx1M', title: 'Inferno', artist: 'Zlatan, Peruzzi & Shoday' },
  { g: 'hiphop', id: 'EmZvOhHF85I', title: 'Beez In The Trap', artist: 'Nicki Minaj ft. 2 Chainz' },
  { g: 'pop', id: 'fHeQemJJQII', title: 'Wonder', artist: 'Shawn Mendes' },
  { g: 'electronic', id: 'a7SouU3ECpU', title: 'Heroes (we could be)', artist: 'Alesso ft. Tove Lo' },
  { g: 'electronic', id: 'URma_gu1aNE', title: 'Sunset', artist: 'The Midnight' },
  { g: 'electronic', id: 'TvZskcqdYcE', title: 'Running in the Night', artist: 'FM-84 ft. Ollie Wride' },
  { g: 'electronic', id: 'v0xAWmTbInM', title: 'Back to You', artist: 'Timecop1983' },
  { g: 'hiphop', id: '4JipHEz53sU', title: 'Super Bass', artist: 'Nicki Minaj' },
  { g: 'hiphop', id: 'SeIJmciN8mo', title: 'Starships', artist: 'Nicki Minaj' },
  { g: 'hiphop', id: 'voT9hOs6FZc', title: 'Yeah Glo!', artist: 'GloRilla' },
  { g: 'afrobeat', id: 'tupb4xV-15w', title: 'Zanku (Legwork)', artist: 'Zlatan' },
  { g: 'electronic', id: '93ASUImTedo', title: 'Latch', artist: 'Disclosure ft. Sam Smith' },
  { g: 'soul', id: 'hKgl5-lkT8U', title: 'Best Part', artist: 'Daniel Caesar ft. H.E.R.' },
  /* v10.114: requested artists (Ava Max, David Guetta, Alan Walker) + more popular picks — oEmbed-verified, not already listed */
  { g: 'pop', id: 'WXBHCQYxwr0', title: 'Sweet but Psycho', artist: 'Ava Max' },
  { g: 'pop', id: 'jH1RNk8954Q', title: 'Kings & Queens', artist: 'Ava Max' },
  { g: 'electronic', id: 'uO59tfQ2TbA', title: 'Hey Mama', artist: 'David Guetta ft. Nicki Minaj, Bebe Rexha & Afrojack' },
  { g: 'electronic', id: '90RLzVUuXe4', title: "I'm Good (Blue)", artist: 'David Guetta & Bebe Rexha' },
  { g: 'electronic', id: 'NUVCQXMUVnI', title: 'Memories', artist: 'David Guetta ft. Kid Cudi' },
  { g: 'electronic', id: '1-xGerv5FOk', title: 'Alone', artist: 'Alan Walker' },
  { g: 'electronic', id: 'M-P4QBt-FWw', title: 'Darkside', artist: 'Alan Walker ft. Au/Ra & Tomine Harket' },
  { g: 'electronic', id: 'dhYOPzcsbGM', title: 'On My Way', artist: 'Alan Walker, Sabrina Carpenter & Farruko' },
  { g: 'pop', id: 'QU9c0053UAU', title: 'Seven', artist: 'Jung Kook ft. Latto' },
  { g: 'pop', id: 'SXiSVQZLje8', title: 'Side To Side', artist: 'Ariana Grande ft. Nicki Minaj' },
  { g: 'pop', id: 'tcYodQoapMg', title: 'positions', artist: 'Ariana Grande' },
  { g: 'pop', id: '9HDEHj2yzew', title: 'Physical', artist: 'Dua Lipa' },
  { g: 'pop', id: '0yW7w8F2TVA', title: "Say You Won't Let Go", artist: 'James Arthur' },
  /* popular hits + Lukas Graham / LG Malique — official uploads, oEmbed-verified */
  { g: 'pop', id: 'kffacxfA7G4', title: 'Baby', artist: 'Justin Bieber ft. Ludacris' },
  { g: 'pop', id: 'tt2k8PGm-TI', title: 'Dusk Till Dawn', artist: 'ZAYN ft. Sia' },
  { g: 'pop', id: '8UVNT4wvIGY', title: 'Somebody That I Used To Know', artist: 'Gotye ft. Kimbra' },
  { g: 'latin', id: 'TyHvyGVs42U', title: 'Échame La Culpa', artist: 'Luis Fonsi & Demi Lovato' },
  { g: 'latin', id: '7zp1TbLFPp8', title: 'Danza Kuduro', artist: 'Don Omar ft. Lucenzo' },
  { g: 'latin', id: 'wnJ6LuUFpMo', title: 'Mi Gente', artist: 'J Balvin & Willy William' },
  { g: 'rock', id: '09839DpTctU', title: 'Hotel California (Live 1977)', artist: 'Eagles' },
  { g: 'rock', id: '8SbUC-UaAxE', title: 'November Rain', artist: 'Guns N\' Roses' },
  { g: 'rock', id: 'mCHUw7ACS8o', title: 'Dirty Paws', artist: 'Of Monsters and Men' },
  { g: 'hiphop', id: 'RubBzkZzpUA', title: 'Started From the Bottom', artist: 'Drake' },
  { g: 'classics', id: 'PIb6AZdTr-A', title: 'Girls Just Want To Have Fun', artist: 'Cyndi Lauper' },
  { g: 'pop', id: 'QcIy9NiNbmo', title: 'Bad Blood', artist: 'Taylor Swift ft. Kendrick Lamar' },
  { g: 'pop', id: 'qrO4YZeyl0I', title: 'Bad Romance', artist: 'Lady Gaga' },
  { g: 'pop', id: 'oygrmJFKYZY', title: 'Don\'t Start Now', artist: 'Dua Lipa' },
  { g: 'pop', id: 'papuvlVeZg8', title: 'Rockabye', artist: 'Clean Bandit ft. Sean Paul & Anne-Marie' },
  { g: 'hiphop', id: 'WILNIXZr2oc', title: 'MIDDLE CHILD', artist: 'J. Cole' },
  { g: 'hiphop', id: '_CL6n0FJZpk', title: 'Still D.R.E.', artist: 'Dr. Dre ft. Snoop Dogg' },
  { g: 'rock', id: 'StZcUAPRRac', title: 'Sonne', artist: 'Rammstein' },
  { g: 'rock', id: '3YxaaGgTQYM', title: 'Bring Me To Life', artist: 'Evanescence' },
  { g: 'country', id: '1vrEljMfXYo', title: 'Take Me Home, Country Roads', artist: 'John Denver' },
  { g: 'classics', id: 'rY0WxgSXdEE', title: 'Another One Bites the Dust', artist: 'Queen' },
  { g: 'classics', id: 'oRdxUFDoQe0', title: 'Beat It', artist: 'Michael Jackson' },
  { g: 'latin', id: '_I_D_8Z4sJE', title: 'X (EQUIS)', artist: 'Nicky Jam x J. Balvin' },
  { g: 'pop', id: 'LHCob76kigA', title: '7 Years', artist: 'Lukas Graham' },
  { g: 'hiphop', id: 'yrvv6h7UeGc', title: 'Seven Years', artist: 'LG Malique & Lukas Graham' },
  { g: 'hiphop', id: '42bnGiaaPPI', title: 'Vision', artist: 'LG Malique' },
  { g: 'hiphop', id: 'wEAJbgT73qI', title: 'Too Easy', artist: 'LG Malique' },
  { g: 'hiphop', id: 'LfUK1puC7X0', title: 'Ion Know Why', artist: 'LG Malique' },
  { g: 'pop', id: 'pB-5XG-DbAA', title: 'Stay With Me', artist: 'Sam Smith' },
  { g: 'pop', id: 'djV11Xbc914', title: 'Take On Me', artist: 'a-ha' },
  { g: 'rock', id: '0-7IHOXkiV8', title: 'Way Down We Go', artist: 'KALEO' },
  { g: 'electronic', id: 'PWhMoGt0cs8', title: 'Whole Heart', artist: 'Gryffin & Bipolar Sunshine' },
  { g: 'pop', id: 'M11SvDtPBhA', title: 'Party In The U.S.A.', artist: 'Miley Cyrus' },
  { g: 'hiphop', id: 'S9bCLPwzSC0', title: 'Mockingbird', artist: 'Eminem' },
  { g: 'hiphop', id: 'eJEKHdvntPI', title: 'Savage', artist: 'Megan Thee Stallion' },
  { g: 'hiphop', id: '8HBcV0MtAQg', title: 'No Role Modelz', artist: 'J. Cole' },
  { g: 'hiphop', id: '6vwNcNOTVzY', title: 'Gold Digger', artist: 'Kanye West ft. Jamie Foxx' },
  { g: 'electronic', id: 'CCHdMIEGaaM', title: 'Get Lucky', artist: 'Daft Punk ft. Pharrell Williams' },
  { g: 'electronic', id: 'u31thuMehjM', title: 'Losing It', artist: 'FISHER' },
  { g: 'electronic', id: 'RnBT9uUYb1w', title: 'In The Name Of Love', artist: 'Martin Garrix & Bebe Rexha' },
  { g: 'soul', id: 'Nuanwn3v-2I', title: 'Ain\'t No Sunshine', artist: 'Bill Withers' },
  { g: 'soul', id: 'BYiN-8NSCCI', title: 'A Change Is Gonna Come', artist: 'Sam Cooke' },
  { g: 'soul', id: 'P1C6PVC8Cp8', title: 'Respect', artist: 'Aretha Franklin' },
  { g: 'soul', id: 'XXx6RDzR6eM', title: 'Let\'s Stay Together', artist: 'Al Green' },
  { g: 'soul', id: 'nxuzYWcY2O0', title: 'Redbone', artist: 'Childish Gambino' },
  { g: 'soul', id: '0CFuCYNx-1g', title: 'Superstition', artist: 'Stevie Wonder' },
  { g: 'country', id: 'Ixrje2rXLMA', title: 'Jolene', artist: 'Dolly Parton' },
  { g: 'country', id: 'b7P97b64Q5E', title: 'Friends in Low Places', artist: 'Garth Brooks' },
  { g: 'pop', id: 'zABLecsR5UE', title: 'Someone You Loved', artist: 'Lewis Capaldi' },
  { g: 'pop', id: 'CvBfHwUxHIk', title: 'Umbrella', artist: 'Rihanna ft. JAY-Z' },
  { g: 'pop', id: '34Na4j8AVgA', title: 'Starboy', artist: 'The Weeknd ft. Daft Punk' },
  { g: 'pop', id: 'OiC1rgCPmUQ', title: 'Dance The Night', artist: 'Dua Lipa' },
  { g: 'pop', id: 'e-fA-gBCkj0', title: 'Locked Out Of Heaven', artist: 'Bruno Mars' },
  { g: 'hiphop', id: 'PWgvGjAhvIw', title: 'Hey Ya!', artist: 'OutKast' },
  { g: 'hiphop', id: 'mzB1VGEGcSU', title: 'Lucid Dreams', artist: 'Juice WRLD' },
  { g: 'hiphop', id: 'UNZqm3dxd2w', title: 'The Box', artist: 'Roddy Ricch' },
  { g: 'hiphop', id: 'S-sJp1FfG7Q', title: 'Bad and Boujee', artist: 'Migos ft. Lil Uzi Vert' },
  { g: 'hiphop', id: 'WrsFXgQk5UI', title: 'XO Tour Llif3', artist: 'Lil Uzi Vert' },
  { g: 'hiphop', id: '2IH8tNQAzSs', title: 'Lollipop', artist: 'Lil Wayne ft. Static Major' },
  { g: 'hiphop', id: 'glEiPXAYE-U', title: 'Hypnotize', artist: 'The Notorious B.I.G.' },
  { g: 'hiphop', id: 'I4DjHHVHWAE', title: 'Rich Flex', artist: 'Drake & 21 Savage' },
  { g: 'electronic', id: 'WSeNSzJ2-Jw', title: 'Scary Monsters and Nice Sprites', artist: 'Skrillex' },
  { g: 'electronic', id: 'HMUDVMiITOU', title: 'Turn Down for What', artist: 'DJ Snake & Lil Jon' },
  { g: 'electronic', id: 'h7ArUgxtlJs', title: 'Ghosts n Stuff', artist: 'deadmau5 ft. Rob Swire' },
  { g: 'electronic', id: '0EWbonj7f18', title: 'Tsunami', artist: 'DVBBS & Borgeous' },
  { g: 'electronic', id: 'Tx1sqYc3qas', title: 'Silence', artist: 'Marshmello ft. Khalid' },
  { g: 'electronic', id: 'i-gyZ35074k', title: 'Stay The Night', artist: 'Zedd ft. Hayley Williams' },
  { g: 'electronic', id: 'pBkHHoOIIn8', title: 'Feel It Still', artist: 'Portugal. The Man' },
  { g: 'soul', id: 'bEeaS6fuUoA', title: 'Lovely Day', artist: 'Bill Withers' },
  { g: 'soul', id: 'hwZNL7QVJjE', title: 'Stand By Me', artist: 'Ben E. King' },
  { g: 'soul', id: 'H-kA3UtBj4M', title: 'What\'s Going On', artist: 'Marvin Gaye' },
  { g: 'soul', id: 'pTdihu-mp90', title: 'I Got You (I Feel Good)', artist: 'James Brown' },
  { g: 'soul', id: '1qJU8G7gR_g', title: 'At Last', artist: 'Etta James' },
  { g: 'soul', id: 'KUmZp8pR1uc', title: 'Rehab', artist: 'Amy Winehouse' },
  { g: 'soul', id: 'bixuI_GV5I0', title: 'Valerie', artist: 'Amy Winehouse' },
  { g: 'country', id: 'hvKyBcCDOB4', title: 'Wagon Wheel', artist: 'Darius Rucker' },
  { g: 'country', id: 'awzNHuGqoMc', title: 'Humble and Kind', artist: 'Tim McGraw' },
  { g: 'country', id: '1WaV2x8GXj0', title: 'Ring of Fire', artist: 'Johnny Cash' },
  { g: 'latin', id: 'b8I-7Wk_Vbc', title: 'Bailando', artist: 'Enrique Iglesias' },
  { g: 'gospel', id: 'UuuZMg6NVeA', title: 'Every Praise', artist: 'Hezekiah Walker' },
  { g: 'gospel', id: '8DhO5YOhTx4', title: 'Withholding Nothing', artist: 'William McDowell' },
  { g: 'afrobeat', id: 'e8GzTXRAJ30', title: 'Free Mind', artist: 'Tems' },
  { g: 'pop', id: 'bnVUHWCynig', title: 'Halo', artist: 'Beyonce' },
  { g: 'pop', id: 'ViwtNLUqkMY', title: 'Crazy In Love', artist: 'Beyonce' },
  { g: 'pop', id: '4m1EFMoRFvY', title: 'Single Ladies', artist: 'Beyonce' },
  { g: 'pop', id: 'WDZJPJV__bQ', title: 'Formation', artist: 'Beyonce' },
  { g: 'pop', id: 'sQgd6MccwZc', title: 'Say My Name', artist: 'Destiny\'s Child' },
  { g: 'pop', id: 'Wmc8bQoL-J0', title: 'Survivor', artist: 'Destiny\'s Child' },
  { g: 'pop', id: 'P00HMxdsVZI', title: 'Truth Hurts', artist: 'Lizzo' },
  { g: 'pop', id: 'IXXxciRUMzE', title: 'About Damn Time', artist: 'Lizzo' },
  { g: 'pop', id: 'lt6PVVr4B04', title: 'So Yesterday', artist: 'Hilary Duff' },
  { g: 'hiphop', id: 'tfSS1e3kYeo', title: 'HIGHEST IN THE ROOM', artist: 'Travis Scott' },
  { g: 'hiphop', id: 'KnZ8h3MRuYg', title: 'Antidote', artist: 'Travis Scott' },

  { g: 'hiphop', id: 'RXL2RQLP-0k', title: 'Like A Boss', artist: 'Slim Thug' },
  { g: 'hiphop', id: '-TdfjZrtAvM', title: 'Get Throwed', artist: 'Bun B' },
  { g: 'hiphop', id: 'WG3qnNkmqvU', title: 'Int\'l Players Anthem', artist: 'UGK' },
  { g: 'hiphop', id: 'CtwJvgPJ9xw', title: 'Ridin', artist: 'Chamillionaire' },
  { g: 'hiphop', id: 'WWEs82u37Mw', title: 'Lose My Mind', artist: 'Don Toliver' },
  { g: 'hiphop', id: 'VpmuI_kyEeQ', title: 'Meet Again', artist: 'Maxo Kream' },
  { g: 'hiphop', id: '_EyZUTDAH0U', title: 'Butterfly Effect', artist: 'Travis Scott' },
  { g: 'rock', id: 'fuKDBPw8wQA', title: 'Panama', artist: 'Van Halen' },
  { g: 'rock', id: 'lDK9QqIzhwk', title: 'Livin\' On A Prayer', artist: 'Bon Jovi' },
  { g: 'rock', id: 'pAgnJDJN4VA', title: 'Back In Black', artist: 'AC/DC' },
  { g: 'rock', id: 'x3idGV-7kSQ', title: 'Don\'t Stop Believin\'', artist: 'Journey' },
  { g: 'rock', id: '7wRHBLwpASw', title: 'Sharp Dressed Man', artist: 'ZZ Top' },
  { g: 'rock', id: 'FTQbiNvZqaY', title: 'Africa', artist: 'Toto' },
  { g: 'rock', id: '9jK-NcRmVcw', title: 'The Final Countdown', artist: 'Europe' },
  { g: 'electronic', id: 'ZVS6Q_lbKQ0', title: 'Nightcall', artist: 'Kavinsky' },
  { g: 'electronic', id: 'FGBhQbmPwH8', title: 'One More Time', artist: 'Daft Punk' },
  { g: 'electronic', id: 'ALZHF5UqnU4', title: 'Alone', artist: 'Marshmello' },
  { g: 'electronic', id: 'dGghkjpNCQ8', title: 'Feel So Close', artist: 'Calvin Harris' },
  { g: 'electronic', id: 'tKi9Z-f6qX4', title: 'Strobe', artist: 'Deadmau5' },
  { g: 'electronic', id: '-nC5TBv3sfU', title: 'Tech Noir', artist: 'Gunship' },
  { g: 'electronic', id: 'RY66fdMt4vc', title: 'Future Club', artist: 'Perturbator' },
  { g: 'electronic', id: 'YJVmu6yttiw', title: 'Bangarang', artist: 'Skrillex' },
  { g: 'electronic', id: 'erb4n8PW2qw', title: 'Sandstorm', artist: 'Darude' },
  { g: 'country', id: '7hx4gdlfamo', title: 'The Gambler', artist: 'Kenny Rogers' },
  { g: 'country', id: 'BAm4nHFOir0', title: 'Killin\' Time', artist: 'Clint Black' },
  { g: 'country', id: 'kQ8xqyoZXCc', title: 'Follow Your Arrow', artist: 'Kacey Musgraves' },
  { g: 'country', id: 'v2LixP7n_hM', title: '\'Til You Can\'t', artist: 'Cody Johnson' },
  { g: 'rock', id: 'SwYN7mTi6HM', title: 'Jump', artist: 'Van Halen' },
  { g: 'movies', id: 'JuSsvM8B4Jc', title: 'Cornfield Chase (Interstellar)', artist: 'Hans Zimmer' },
  { g: 'movies', id: 'kpK4cDk2bRs', title: 'No Time for Caution (Interstellar)', artist: 'Hans Zimmer' },
  { g: 'afrobeat', id: 'R4qud199tQk', title: 'Ku Lo Sa', artist: 'Oxlade' },
  { g: 'afrobeat', id: 'to8nQNGarRw', title: 'Monalisa', artist: 'Lojay' },
  { g: 'gospel', id: 'Vv9-WlymKg0', title: 'Total Praise', artist: 'Richard Smallwood' },
  { g: 'gospel', id: 'OwNzTSLE-4Q', title: 'Blessings On Blessings', artist: 'Anthony Brown' },
  { g: 'gospel', id: 'Z-ln__MWpKA', title: 'Ekwueme', artist: 'Prospa Ochimana' },
  { g: 'hiphop', id: '5qm8PH4xAss', title: 'In Da Club', artist: '50 Cent' },
  { g: 'hiphop', id: '_JZom_gVfuw', title: 'Juicy', artist: 'The Notorious B.I.G.' },
  { g: 'hiphop', id: 'J7_bMdYfSws', title: 'California Love', artist: '2Pac' },
  { g: 'hiphop', id: 'UTHLKHL_whs', title: 'Industry Baby', artist: 'Lil Nas X' },
  { g: 'hiphop', id: '0nF69UTw99E', title: 'Money Trees', artist: 'Kendrick Lamar' },
  { g: 'hiphop', id: 'phaJXp_zMYM', title: 'Big Poppa', artist: 'The Notorious B.I.G.' },
  { g: 'afrobeat', id: 'HLnf2Hz7uNQ', title: 'Kese (Dance)', artist: 'Wizkid' },
  { g: 'afrobeat', id: 'KK4dC7rASYs', title: 'Tshwala Bam', artist: 'TitoM & Yuppe' },
  { g: 'afrobeat', id: 'g_hgm2Mf6Ag', title: 'Mnike', artist: 'Tyler ICU' },
  { g: 'afrobeat', id: 'v8SNlvR86xc', title: 'Overloading', artist: 'Mavins' },
  { g: 'afrobeat', id: 'IbBkzvshxmA', title: 'Jaho', artist: 'Kizz Daniel' },
  { g: 'afrobeat', id: '7fhtbd5NxW0', title: 'Gwagwalada', artist: 'BNXN' },
  { g: 'afrobeat', id: 'RhS0aKygDww', title: 'Electricity', artist: 'Pheelz' },
  { g: 'afrobeat', id: 'SmbzdwnpZZs', title: 'Away', artist: 'Ayra Starr' },
  { g: 'pop', id: 'To4SWGZkEPk', title: 'Greedy', artist: 'Tate McRae' },
  { g: 'pop', id: 'NTpbbQUBbuo', title: 'Too Sweet', artist: 'Hozier' },
  { g: 'pop', id: '1RKqOmSkGgM', title: 'Good Luck, Babe!', artist: 'Chappell Roan' },
  { g: 'pop', id: 'PEM0Vs8jf1w', title: 'Golden Hour', artist: 'JVKE' },
  { g: 'pop', id: 'Uq9gPaIzbe8', title: 'Unholy', artist: 'Sam Smith' },
  { g: 'pop', id: 'Il0S8BoucSA', title: 'Shivers', artist: 'Ed Sheeran' },
  { g: 'gospel', id: 'qpiRLQfXlZw', title: 'Most High', artist: 'Maverick City Music' },
  { g: 'gospel', id: 'x9ndiD0_qNk', title: 'Firm Foundation', artist: 'Cody Carnes' },
  { g: 'gospel', id: 'BOK8F9caDic', title: 'Champion', artist: 'Dante Bowe' },
  { g: 'gospel', id: 'SlEEgMWwxhc', title: 'Holy Forever', artist: 'Chris Tomlin' },
  { g: 'gospel', id: 'QBO7JEdmBGk', title: 'Victory Belongs To Jesus', artist: 'Todd Dulaney' },
  { g: 'gospel', id: 'MvHP_ODvN6Q', title: 'Because Of Who You Are', artist: 'Martha Munizzi' },
  { g: 'gospel', id: 'cjZe8o1CzH8', title: 'Yahweh', artist: 'Moses Bliss' },
  { g: 'gospel', id: 'SuQWzw2qcmo', title: 'Bigger Everyday', artist: 'Moses Bliss' },
  { g: 'gospel', id: 'W1MaOOOQpDs', title: 'Onise Iyanu', artist: 'Nathaniel Bassey' },
  { g: 'gospel', id: 'ul6i6Kz2p2k', title: 'You Are Good', artist: 'Israel Houghton' },
  { g: 'gospel', id: '_OZ5slPSk2E', title: 'Melodies From Heaven', artist: 'Kirk Franklin' },
  { g: 'hiphop', id: 'Z-48u_uWMHY', title: 'Alright', artist: 'Kendrick Lamar' },
  { g: 'hiphop', id: 'MYxAiK6VnXw', title: 'Ms. Jackson', artist: 'Outkast' },
  { g: 'hiphop', id: 'fWCZse1iwE0', title: 'Gin and Juice', artist: 'Snoop Dogg' },
  { g: 'hiphop', id: '8GliyDgAGQI', title: 'Nuthin\' But A G Thang', artist: 'Dr. Dre' },
  { g: 'hiphop', id: 'vk6014HuxcE', title: 'Empire State Of Mind', artist: 'Jay-Z' },
  { g: 'hiphop', id: 'PsO6ZnUZI0g', title: 'Stronger', artist: 'Kanye West' },
  { g: 'hiphop', id: 'l0U7SxXHkPY', title: 'Life Is Good', artist: 'Future' },
  { g: 'hiphop', id: 'B5YNiCfWC3A', title: 'Swimming Pools', artist: 'Kendrick Lamar' },
  { g: 'hiphop', id: 'hI8A14Qcv68', title: 'N.Y. State Of Mind', artist: 'Nas' },
  { g: 'hiphop', id: 'ThlhSnRk21E', title: 'Ruff Ryders\' Anthem', artist: 'DMX' },
  /* Nov 2026 request pack — skip dupes via ALL id-set */
  { g: 'rock', id: 'd020hcWA_Wg', title: 'Clocks', a: 'Coldplay' },
  { g: 'classics', id: 'OMOGaugKpzs', title: 'Every Breath You Take', a: 'The Police' },
  { g: 'pop', id: 'E8gmARGvPlI', title: 'Last Christmas', a: 'Wham!' },
  { g: 'pop', id: 'aAkMkVFwAoo', title: 'All I Want for Christmas Is You', a: 'Mariah Carey' },
  { g: 'pop', id: 'ZeyHl1tQeaQ', title: 'Merry Christmas Everyone', a: 'Shakin\' Stevens' },
  { g: 'pop', id: 'yKNxeF4KMsY', title: 'Yellow', a: 'Coldplay' },
  { g: 'pop', id: 'ko70cExuzZM', title: 'The Fate of Ophelia', a: 'Taylor Swift' },
  { g: 'hiphop', id: 'CTFtOOh47oo', title: 'Unforgettable', a: 'French Montana ft. Swae Lee' },
  { g: 'hiphop', id: 'JQbjS0_ZfJ0', title: 'All The Stars', a: 'Kendrick Lamar, SZA' },
  { g: 'hiphop', id: 'mym4sKoAnKs', title: 'One Dance', a: 'Drake ft. Wizkid & Kyla' },
  { g: 'movies', id: 'QdBZY2fkU-0', title: 'Grand Theft Auto VI Trailer 1', a: 'Rockstar Games' },
  { g: 'pop', id: 'rK5TyISxZ_M', title: 'WHERE IS MY HUSBAND!', a: 'RAYE' },
  { g: 'pop', id: 'cSnkWzZ7ZAA', title: 'Whistle', a: 'Flo Rida' },
  { g: 'classics', id: 'YkADj0TPrJA', title: 'In The Air Tonight', a: 'Phil Collins' },
  { g: 'classics', id: 'Zi_XLOBDo_Y', title: 'Billie Jean', a: 'Michael Jackson' },
  { g: 'classics', id: 'oRdxUFDoQe0', title: 'Beat It', a: 'Michael Jackson' },
  { g: 'classics', id: 'sOnqjkJTMaA', title: 'Thriller', a: 'Michael Jackson' },
  { g: 'rock', id: 'hhSLkkLl750', title: 'How You Remind Me', a: 'Nickelback' },
  { g: 'rock', id: 'NdYWuo9OFAw', title: 'Iris', a: 'Goo Goo Dolls' },
  { g: 'pop', id: 'xy3AcmW0lrQ', title: 'End Of Beginning', a: 'Djo' },
  { g: 'pop', id: 'psuRGfAaju4', title: 'Fireflies', a: 'Owl City' },
  { g: 'pop', id: 'oofSnsGkops', title: 'You\'re Beautiful', a: 'James Blunt' },
  { g: 'hiphop', id: 'mzB1VGEGcSU', title: 'Lucid Dreams', a: 'Juice WRLD' },
  { g: 'hiphop', id: 'onbC6N-QGPc', title: 'Lucid Dreams (Forget Me)', a: 'Juice WRLD' },
  { g: 'pop', id: 'yebNIHKAC4A', title: 'Golden', a: 'HUNTR/X · KPop Demon Hunters' },
  { g: 'electronic', id: 'EPo5wWmKEaI', title: 'Give Me Everything', a: 'Pitbull ft. Ne-Yo, Afrojack, Nayer' },
  { g: 'electronic', id: 'euCqAq6BRa4', title: 'Let Me Love You', a: 'DJ Snake ft. Justin Bieber' },
  { g: 'afrobeat', id: 'z22zRnTlgMg', title: 'Gratitude', a: 'Asake' },
  { g: 'afrobeat', id: 'e8GzTXRAJ30', title: 'Free Mind', a: 'Tems' },
  { g: 'hiphop', id: 'Jg5wkZ-dJXA', title: 'Runaway', a: 'Kanye West' },
  { g: 'hiphop', id: 'sNY_2TEmzho', title: 'luther', a: 'Kendrick Lamar, SZA' },
  { g: 'hiphop', id: 'mxFstYSbBmc', title: 'ROCKSTAR', a: 'DaBaby ft. Roddy Ricch' },
  { g: 'hiphop', id: 'YS0h2-hy9rw', title: 'Ballin’', a: 'Mustard ft. Roddy Ricch' },
  { g: 'hiphop', id: 'UNZqm3dxd2w', title: 'The Box', a: 'Roddy Ricch' },
  { g: 'rock', id: '1w7OgIMMRc4', title: 'Sweet Child O\' Mine', a: 'Guns N\' Roses' },
  { g: 'rock', id: 'lDK9QqIzhwk', title: 'Livin\' On A Prayer', a: 'Bon Jovi' },
  { g: 'rock', id: 'hTWKbfoikeg', title: 'Smells Like Teen Spirit', a: 'Nirvana' },
  { g: 'rock', id: 'fJ9rUzIMcZQ', title: 'Bohemian Rhapsody', a: 'Queen' },
  { g: 'pop', id: '7wtfhZwyrcc', title: 'Believer', a: 'Imagine Dragons' },
  { g: 'pop', id: 'fKopy74weus', title: 'Thunder', a: 'Imagine Dragons' },
  { g: 'pop', id: 'hT_nvWreIhg', title: 'Counting Stars', a: 'OneRepublic' },
  { g: 'pop', id: '2vjPBrBU-TM', title: 'Chandelier', a: 'Sia' },
  { g: 'pop', id: 'OPf0YbXqDm0', title: 'Uptown Funk', a: 'Mark Ronson ft. Bruno Mars' },
  { g: 'pop', id: 'kJQP7kiw5Fk', title: 'Despacito', a: 'Luis Fonsi ft. Daddy Yankee' },
  { g: 'pop', id: 'fRh_vgS2dFE', title: 'Sorry', a: 'Justin Bieber' },
  { g: 'pop', id: '8UVNT4wvIGY', title: 'Somebody That I Used To Know', a: 'Gotye ft. Kimbra' },
  { g: 'pop', id: 'hLQl3WQQoQ0', title: 'Someone Like You', a: 'Adele' },
  { g: 'pop', id: 'rYEDA3JcQqw', title: 'Rolling in the Deep', a: 'Adele' },
  { g: 'pop', id: 'YQHsXMglC9A', title: 'Hello', a: 'Adele' },
  { g: 'pop', id: 'nfWlot6h_JM', title: 'Shake It Off', a: 'Taylor Swift' },
  { g: 'pop', id: 'e-ORhEE9VVg', title: 'Blank Space', a: 'Taylor Swift' },
  { g: 'electronic', id: 'IcrbM1l_BoI', title: 'Wake Me Up', a: 'Avicii' },
  { g: 'electronic', id: 'C-u5WLJ9Yk4', title: '...Baby One More Time', a: 'Britney Spears' },
  { g: 'electronic', id: 'dX3k_QDnzHE', title: 'Midnight City', a: 'M83' },
  { g: 'pop', id: '4fndeDfaWCg', title: 'I Want It That Way', a: 'Backstreet Boys' },
  { g: 'pop', id: 'NHozn0YXAeE', title: 'MMMBop', a: 'Hanson' },
  { g: 'rock', id: '6hzrDeceEKc', title: 'Wonderwall', a: 'Oasis' },
  { g: 'pop', id: 'VV1XWJN3nJo', title: 'Torn', a: 'Natalie Imbruglia' },
  { g: 'pop', id: 'KQ6zr6kCPj8', title: 'Party Rock Anthem', a: 'LMFAO' },
  { g: 'pop', id: '0KSOMA3QBU0', title: 'Dark Horse', a: 'Katy Perry ft. Juicy J' },
  { g: 'pop', id: 'CevxZvSJLk8', title: 'Roar', a: 'Katy Perry' },
  { g: 'pop', id: '09R8_2nJtjg', title: 'Sugar', a: 'Maroon 5' },
  { g: 'pop', id: 'ru0K8uYEZWw', title: 'CAN\'T STOP THE FEELING!', a: 'Justin Timberlake' },
  { g: 'pop', id: 'fLexgOxsZu0', title: 'The Lazy Song', a: 'Bruno Mars' },
  { g: 'rock', id: 'eVTXPUF4Oz4', title: 'In The End', a: 'Linkin Park' },
  { g: 'rock', id: 'tAGnKpE4NCI', title: 'Nothing Else Matters', a: 'Metallica' },
  { g: 'rock', id: 'CD-E-LDc384', title: 'Enter Sandman', a: 'Metallica' },
  { g: 'electronic', id: '1y6smkh6c-0', title: 'Don\'t You Worry Child', a: 'Swedish House Mafia' },
  /* —— Expand toward 1000: requested misses + popular fill (Nov 2026) —— */
  { g: 'hiphop', id: '0qEJBtfQ5FM', title: 'Beez In The Trap X What\'s Up Mashup' },
  { g: 'classics', id: 'Qt2mbGP6vFI', title: 'Another Day In Paradise', a: 'Phil Collins' },
  { g: 'rock', id: 'qnkuBUAwfe0', title: 'One Last Breath', a: 'Creed' },
  { g: 'afrobeat', id: '2ZTcvsdMR1c', title: 'Heaven Baby', a: 'Ayra Starr ft. ZAYN' },
  { g: 'hiphop', id: 'Kzq15y2J4UM', title: 'Young Forever', a: 'JAY-Z ft. Mr Hudson' },
  { g: 'afrobeat', id: 'ZxVoKFIM8tw', title: 'Premier Gaou', a: 'Magic System' },
  { g: 'afrobeat', id: 'wHfaCXRVO8U', title: 'Diana', a: 'Tekno' },
  { g: 'afrobeat', id: 'RQOg16kmFJM', title: 'WORSHIP', a: 'Asake, DJ Snake' },
  { g: 'pop', id: 'Ys7-6_t7OEQ', title: 'Beauty And A Beat', a: 'Justin Bieber ft. Nicki Minaj' },
  { g: 'gospel', id: 'BSBM0gFmyuE', title: 'UP!', a: 'Forrest Frank & Connor Price' },
  { g: 'soul', id: 'VF-FGf_ZZiI', title: 'Bad Habit', a: 'Steve Lacy' },
  { g: 'hiphop', id: 'rVD-zV6ctoM', title: 'E85', a: 'Don Toliver' },
  { g: 'hiphop', id: 'egemoVK0IKY', title: 'Anxiety', a: 'Doechii' },
  { g: 'pop', id: 'HdAkYCyCZv8', title: 'Mama Said', a: 'Lukas Graham' },
  { g: 'hiphop', id: '6CHs4x2uqcQ', title: 'Good Morning', a: 'Kanye West' },
  { g: 'hiphop', id: '-SSgaCAsU6M', title: '25', a: 'Rod Wave' },
  { g: 'pop', id: 'Jzrui2W8Jqk', title: 'Destiny', a: 'FROM FALL TO SPRING' },
  { g: 'classics', id: 'e_KWpQE7mok', title: 'Destiny of this life', a: 'The Jacksons' },
  { g: 'hiphop', id: 'fPEXSSJZJDw', title: 'All Girls Are The Same', a: 'Juice WRLD' },
  { g: 'hiphop', id: 'ixcoAc2vqso', title: 'Robbery', a: 'Juice WRLD' },
  { g: 'hiphop', id: 'UjlAzToRoRs', title: 'Wishing Well', a: 'Juice WRLD' },
  { g: 'hiphop', id: 'D4pA4e8vMwA', title: 'Come & Go', a: 'Juice WRLD & Marshmello' },
  { g: 'hiphop', id: '5wfr5dOHT_0', title: 'Righteous', a: 'Juice WRLD' },
  { g: 'hiphop', id: 'VDvr08sCPOc', title: 'Legends', a: 'Juice WRLD' },
  { g: 'classics', id: 'H5d42-Kd5fs', title: 'Against All Odds', a: 'Phil Collins' },
  { g: 'classics', id: 'wVE78v2U2eY', title: 'Easy Lover', a: 'Philip Bailey & Phil Collins' },
  { g: 'pop', id: 'wdTPEh7cKVI', title: 'Bad Habits', a: 'Ed Sheeran' },
  { g: 'pop', id: 'iWZmdoY1aTE', title: 'Girls Like You', a: 'Maroon 5' },
  { g: 'pop', id: 'hBTKyN7S7X0', title: 'Payphone', a: 'Maroon 5' },
  { g: 'pop', id: '5abamRO41fE', title: 'Moves Like Jagger', a: 'Maroon 5' },
  { g: 'pop', id: 'UXYG5v6IDsM', title: 'Can\'t Feel My Face', a: 'The Weeknd' },
  { g: 'pop', id: 'DK_0jXPuIr0', title: 'Love Yourself', a: 'Justin Bieber' },
  { g: 'pop', id: 'ekqkVGCdvYA', title: 'Grenade', a: 'Bruno Mars' },
  { g: 'pop', id: 'CduA0TULnow', title: 'Toxic', a: 'Britney Spears' },
  { g: 'pop', id: 'lWA2fjXjcBM', title: 'Stay', a: 'Rihanna' },
  { g: 'pop', id: 'ehcUmQ-eGpg', title: 'Umbrella', a: 'Rihanna' },
  { g: 'pop', id: 'pt8VYOfr8As', title: '7 Years', a: 'Lukas Graham' },
  { g: 'pop', id: 'LhP3YpKSmxk', title: '7 Years (Audio)', a: 'Lukas Graham' },
  { g: 'rock', id: '3YcBF2gKDdI', title: 'Under The Bridge', a: 'Red Hot Chili Peppers' },
  { g: 'hiphop', id: 'uxpfa-e0mXc', title: 'In My Feelings', a: 'Drake' },
  { g: 'hiphop', id: 'JGulv7GsNQI', title: 'Started From The Bottom', a: 'Drake' },
  { g: 'country', id: 'nY1M_5x_P2Y', title: 'Cruise', a: 'Florida Georgia Line' },
  { g: 'soul', id: '0fTUj9Tkwxc', title: 'If I Ain\'t Got You', a: 'Alicia Keys' },
  { g: 'classics', id: 'q75Vl9kXH4s', title: 'You Can\'t Hurry Love', a: 'Phil Collins' },
  { g: 'pop', id: 'iGm6d8QqBEM', title: 'One More Night', a: 'Maroon 5' },
  { g: 'pop', id: 'LjhCEhWiKXk', title: 'Billionaire', a: 'Travie McCoy' },
  { g: 'pop', id: '2X_2IdybTw0', title: 'Castle On The Hill', a: 'Ed Sheeran' },
  { g: 'pop', id: 'nSDgHBxUbVQ', title: 'The A Team', a: 'Ed Sheeran' },
  { g: 'pop', id: 'iAbnEUA2_9U', title: 'Galway Girl', a: 'Ed Sheeran' },
  { g: 'pop', id: '87gWaAhvY1k', title: 'Happier', a: 'Ed Sheeran' },
  { g: 'pop', id: '6gRRsPvA6oY', title: 'Summer', a: 'Calvin Harris' },
  { g: 'pop', id: 'yEVXimt9VLE', title: 'Feel So Close', a: 'Calvin Harris' },
  { g: 'pop', id: 'y1Zg9YV8p1A', title: 'Outside', a: 'Calvin Harris' },
  { g: 'pop', id: '0HDdjwpPM3Y', title: 'How Deep Is Your Love', a: 'Calvin Harris' },
  /* —— Popular fill pack 2 —— */
  { g: 'pop', id: '09m0B8RRiA0', title: 'Chandelier (Audio)', a: 'Sia' },
  { g: 'pop', id: 'YykjpewL_gQ', title: 'Elastic Heart', a: 'Sia' },
  { g: 'pop', id: 'GCdwKhFsLLw', title: 'Cheap Thrills', a: 'Sia' },
  { g: 'pop', id: 'iEPTlhBMW18', title: 'Timber Official', a: 'Pitbull' },
  { g: 'pop', id: '3JZ_D3ELwOQ', title: 'Timber Remix', a: 'Pitbull' },
  { g: 'pop', id: 'YVkUvmDQ3_0', title: 'See You Again Video', a: 'Wiz Khalifa' },
  { g: 'pop', id: 'IdneKLhsWOQ', title: 'Wildest Dreams', a: 'Taylor Swift' },
  /* —— Popular fill pack 3 (toward 1000) —— */
  { g: 'pop', id: 'WMGxrqpZzV0', title: 'DECADE OF POP Megamix (2008-2018)', a: 'Adamusic' },
  { g: 'pop', id: 'jZ1jJ2QdgV0', title: 'Pop Danthology 2010s Decade Mashup', a: 'Daniel Kim' },
  { g: 'movies', id: '2PpgPxjzbkA', title: 'Moulin Rouge Trailer', a: 'Nicole Kidman' },
  { g: 'soul', id: 'yGHEis32s2Y', title: 'oh yeah?', a: 'Steve Lacy' },
  { g: 'afrobeat', id: 'SOJpE1KMUbo', title: 'Raindance', a: 'Dave ft. Tems' },
  { g: 'afrobeat', id: '6GATRApPww8', title: 'Big 7', a: 'Burna Boy' },
  { g: 'afrobeat', id: 'bGsKQxIwEeQ', title: 'Tested, Approved & Trusted', a: 'Burna Boy' },
  { g: 'afrobeat', id: 'QHb0PwCQPxg', title: 'Wave', a: 'Asake, Central Cee' },
  { g: 'hiphop', id: 'iI34LYmJ1Fs', title: 'Robbery', a: 'Juice WRLD' },
  { g: 'hiphop', id: 'Sw5fNI400E4', title: 'Bandit', a: 'Juice WRLD ft. NBA YoungBoy' },
  { g: 'hiphop', id: 'h3EJICKwITw', title: 'All Girls Are The Same', a: 'Juice WRLD' },
  { g: 'hiphop', id: 'ZengOKCUBHo', title: 'Righteous', a: 'Juice WRLD' },
  { g: 'hiphop', id: 'C5i-UnuUKUI', title: 'Wishing Well', a: 'Juice WRLD' },
  { g: 'hiphop', id: 'r_0JjYUe5jo', title: 'Godzilla', a: 'Eminem ft. Juice WRLD' },
  { g: 'hiphop', id: 'euSAgaub3m8', title: 'Hear Me Calling', a: 'Juice WRLD' },
  { g: 'hiphop', id: 'OcQ71ubUXAE', title: 'Conversations', a: 'Juice WRLD' },
  { g: 'gospel', id: 'sQwUD__WMD0', title: 'Promises', a: 'Maverick City Music' },
  { g: 'gospel', id: 'BZT8jqsc8lQ', title: 'Your Spirit', a: 'Tasha Cobbs Leonard ft. Kierra Sheard' },
  { g: 'gospel', id: 'MimVg0OMGvA', title: 'Made A Way', a: 'Travis Greene' },
  { g: 'gospel', id: 'I66SDeRQSJ4', title: 'Imagine Me', a: 'Kirk Franklin' },
  { g: 'gospel', id: '37wV6D49iEY', title: 'There Was Jesus', a: 'Zach Williams & Dolly Parton' },
  { g: 'gospel', id: '9sJZOGxRxwM', title: 'Praise God', a: 'Kanye West' },
  { g: 'classics', id: 'ZdEZ3Y8c4Ho', title: 'Another Day in Paradise (Live Berlin)', a: 'Phil Collins' },
  { g: 'gospel', id: 'Y6GXzTZGAJg', title: 'K i r k F r a n k l i n Greatest Hits ~ Top Christian Gospel Worship Songs', a: 'Praise Worship Songs Ever' },
  { g: 'gospel', id: 'YPo8rHagQkc', title: 'Kirk Franklin | Top Gospel Music Praise And Worship Hits Playlist | Best Songs Of Kirk Fra', a: 'Gospel Music Praise And Worship' },
  { g: 'gospel', id: 'qNT5ctEKFe0', title: 'Kirk Franklin - The best songs of Kirk Franklin - Gospel Songs', a: 'Gospel Songs' },
  { g: 'gospel', id: 'eGFLmSgyOFY', title: 'Kirk Franklin 2022 - Best of Kirk Franklin - Kirk Franklin Greatest Hits', a: 'Greatest Gospel Songs' },
  { g: 'gospel', id: 'SBJjxiKGZ_k', title: 'Greatest Hit Gospel Songs❤️Donnie McClurkin, Kirk Franklin, Marvin Sapp, Hezekiah Walker,C', a: 'Goodness Of God' },
  { g: 'gospel', id: 'taeHa1qFo5s', title: 'Stomp - Kirk Franklin', a: 'opinionconsentido' },
  { g: 'gospel', id: 'gOvn4KnTjMg', title: 'Kirk Franklin - This Time ft. GloRilla', a: 'Kirk Franklin' },
  { g: 'gospel', id: 'EgZsToDAjTw', title: 'Upbeat Gospel Mix | Kirk Franklin, Mary Mary & Tasha Cobbs', a: 'SUPREMACY SOUNDS' },
  { g: 'gospel', id: 'sn8DvL4Aq9M', title: 'Brighter Day (Live at Lakewood Church, Houston, TX - June 16, 2000)', a: 'Kirk Franklin' },
  { g: 'gospel', id: 'qZoBQ_xebpk', title: 'Kirk Franklin - Top Gospel Music Praise And Worship', a: 'Gospel Songs' },
  { g: 'gospel', id: 'za06CCJ8tyE', title: 'Kirk Franklin (ft. GloRilla) - This Time | From The Block Performance 🎙', a: '4 Shooters Only™ and Kirk Franklin' },
  { g: 'gospel', id: 'qGGKkBqV9NY', title: 'He Reigns / Awesome God (Live at Lakewood Church, Houston, TX - June 16, 2000)', a: 'Kirk Franklin' },
  { g: 'gospel', id: 'og6_QlfBHpo', title: 'T a s h a C o b b s Greatest Hits ~ Top Praise And Worship Songs', a: 'Best 100 Gospel Music' },
  { g: 'gospel', id: 'dYjnlNtWz5M', title: 'Tasha Cobbs - Total Worship Medley (New)', a: 'Revealed TV GH' },
  { g: 'gospel', id: 'OKWkYxikygQ', title: 'Tasha Cobbs - Fill Me Up / Overflow (Medley/Live)', a: 'Tasha Cobbs Leonard' },
  { g: 'gospel', id: 'xz-4jcHJei8', title: 'Tasha Cobbs Leonard - Royalty: Live At The Ryman', a: 'Tasha Cobbs Leonard' },
  { g: 'gospel', id: 'SxEylvmfKOo', title: 'Listen to gospel music of Tasha Cobbs Leonard', a: 'Heal the Soul' },
  { g: 'gospel', id: '3R3gExFFmpc', title: 'Tasha Cobbs Leonard (GOSPEL Music Compilation)', a: 'PEFEPPEL Fam Vlogs' },
  { g: 'gospel', id: 't7owFiihXgg', title: 'Tasha Cobbs Leonard - You Know My Name ft. Jimi Cravity ft. Jimi Cravity', a: 'Tasha Cobbs Leonard' },
  { g: 'gospel', id: 'C5NaI2nn88I', title: 'Tasha Cobbs Leonard, Le\'Andria Johnson - You Know My Name (Live) (Official Live Video)', a: 'Tasha Cobbs Leonard' },
  { g: 'gospel', id: 'vc1iRwinYsk', title: 'All Authority (LIVE)', a: 'Woman Evolve Worship' },
  { g: 'gospel', id: 'i14yf9bk9cg', title: 'All Authority (Live) Official Music Video | Woman Evolve Worship X Tasha Cobbs-Leonard', a: 'Sarah Jakes Roberts' },
  { g: 'gospel', id: 'tCfbas0RZBc', title: 'Tasha Cobbs Leonard - Fill Me Up (Live) + Kierra’s Prayer ft. Kierra Sheard (Official Live', a: 'Tasha Cobbs Leonard' },
  { g: 'gospel', id: 'VKIOpdvrRmU', title: 'Tasha Cobbs Leonard - Church Hymns (Live) ft. Bishop Paul S. Morton (Official Live Video)', a: 'Tasha Cobbs Leonard' },
  { g: 'gospel', id: 'QI0tdLYyuyI', title: 'Best morning Worship Songs 2026 ✝️ Top Christian Praise & Worship Music Playlist | Find Go', a: 'Top Worship Music' },
  { g: 'gospel', id: '8YKJVx4qxcs', title: 'Best Hillsong Worship Songs of All Time | Nonstop Christian Music Playlist', a: 'Top Praise and Worship Songs' },
  { g: 'gospel', id: 'fDGGNbu1qwc', title: 'Worship Music 2026, Hillsong Worship Best Praise Songs Collection, Powerful Worship Songs ', a: 'Worship Songs' },
  { g: 'gospel', id: 'CgW1_iN4A_w', title: 'Goodness Of God, Best Worship Songs 2026 Collection, Christian Music Album, Hillsong Worsh', a: 'Worship Songs' },
  { g: 'gospel', id: 't9FnJSY_EsQ', title: 'Worship Music 2026, Top Praise And Worship Songs 2026 Playlist, Nonstop Christian Songs - ', a: 'Worship Songs and Glory Anthem' },
  { g: 'gospel', id: '7_u-XzqxjKY', title: 'Top Elevation Worship Songs ✝️ O Come to the Altar Elevation Worship - Elevation Playlist ', a: 'Top Praise and Worship Songs' },
  { g: 'gospel', id: 'zKzFXDAiSVs', title: 'Worship Songs 2026 - What A Beautiful Name, Top Hillsong Worship Songs 2026, Nonstop Chris', a: 'Eternal Worship' },
  { g: 'gospel', id: 'iCE_GNifiQM', title: 'Oceans/ Top Hillsong United/ Top Hilllsong Worship 2023', a: 'antkic moar' },
  { g: 'gospel', id: 'rwZCflgu8PE', title: 'Hillsong Worship | Christian Music Playlist | Fast songs of Hillsong', a: 'GUiDance tambourine' },
  { g: 'gospel', id: '3Tdw-gT4msY', title: 'Hillsong Songs & Worship Collection 1997-2017', a: 'Emmanuel FD Munkodi TV' },
  { g: 'gospel', id: 'cL01V3deWtI', title: 'DJ MASUMBUKO - BEST OF HILLSONG WORSHIP VIDEO MIX - WHAT A BEAUTIFUL NAME - I SURRENDER [F', a: 'DJ MASUMBUKO' },
  { g: 'gospel', id: 'rW9MbYQrTUI', title: 'In Control - Hillsong Worship', a: 'Hillsong Worship' },
  { g: 'gospel', id: '02LOnSuPSSo', title: 'ELEVATION WORSHIP X MAVERICK CITY MUSIC 2025 - Chandler Moore, Naomi Raine: Jireh, Most Be', a: 'Heaven\'s Worship Music🎧' },
  { g: 'gospel', id: 'RXVtqCtBP0I', title: 'Best Maverick City Music Songs of All Time | Nonstop Christian Music Playlist', a: 'Top Praise and Worship Songs' },
  { g: 'gospel', id: 'pv6YWlwsFIo', title: 'Elevation Worship & Maverick City and TRIBL |10Hours of Original Worship Mob Worship | Jir', a: 'Maverick City Music ' },
  { g: 'gospel', id: 'K3TYG7Q_fj4', title: 'Wait On You | Elevation Worship & Maverick City', a: 'Elevation Worship' },
  { g: 'gospel', id: 'Viiw6tGimHo', title: 'Million Little Miracles | Elevation Worship & Maverick City', a: 'Elevation Worship' },
  { g: 'gospel', id: 'YbGFYaA0SbY', title: 'God I\'m Just Grateful | Elevation Worship & Chandler Moore', a: 'Elevation Worship and Chandler Moore' },
  { g: 'gospel', id: 'DhelGxoWlyc', title: 'Chandler Moore, Naomi Raine: Elevation Worship & Maverick City : Powerful Gospel Songs Of ', a: 'Heaven\'s Worship Music🎧' },
  { g: 'gospel', id: 'duLKCOmxbJs', title: 'Shall Not Want | Elevation Worship & Maverick City', a: 'Elevation Worship' },
  { g: 'gospel', id: 'QSe8C3zXtLI', title: 'Chandler Moore, Naomi Raine: Elevation Worship & Maverick City : Powerful Gospel Songs Of ', a: 'Heaven\'s Worship Music🎧' },
  { g: 'gospel', id: 'OXsxw1fRHMA', title: 'Talking To Jesus | Elevation Worship & Maverick City', a: 'Elevation Worship' },
  { g: 'gospel', id: 'dQ1xxoP7NJk', title: 'More Than Able (feat. Chandler Moore & Tiffany Hudson) | Elevation Worship', a: 'Elevation Worship' },
  { g: 'gospel', id: 'Xuar5LR8oco', title: 'Best Elevation Worship Songs of All Time | Nonstop Christian Music Playlist', a: 'Top Praise and Worship Songs' },
  { g: 'gospel', id: 'f8zJisDivCA', title: 'Cece Winans - Top 50 Gospel Music Of All Time - The Cece Winans Greatest Hits Full Album', a: 'Black Gospel Music' },
  { g: 'gospel', id: '2xcFM9CBiOE', title: 'CeCe Winans - Holy Forever (Official Music Video)', a: 'CeCe Winans' },
  { g: 'gospel', id: 'RFI4e8HDfEo', title: 'CEEC WINANS BEST GOSPEL ALBUM 🎶 FAMOUS CECE WINANS WORSHIP SONGS 🎶 TOP ANOINTED SONGS WI', a: 'THE AMAZING WORSHIP 🎧' },
  { g: 'gospel', id: 'Lq4PXLxTuVU', title: 'CeCe Winans - Come Jesus Come (Official Video)', a: 'CeCe Winans' },
  { g: 'gospel', id: 'eMzsoxNu1R0', title: 'Best Gospel Music Collection – Most Powerful Worship Songs Ever |Tasha Cobbs, CeCe Winans,', a: 'Hearts of Worship' },
  { g: 'gospel', id: 'NkxH_BPqgFA', title: 'CeCe Winans Mix 2026 🙏 Top 20 Greatest Gospel Mix Songs With Lyrics 2026 🙏 Powerful Gosp', a: 'Powerful Black Gospel Songs' },
  { g: 'gospel', id: '9sE5kEnitqE', title: 'CeCe Winans - Goodness of God (Official Video)', a: 'CeCe Winans' },
  { g: 'gospel', id: 'ZHmx8Sadg3s', title: 'The Cece Winans Greatest Hits Full Album With Lyrics 🙏 Best Contemporary Gospel Of Cece W', a: 'Black Gospel Music' },
  { g: 'gospel', id: 'irudeHYeLcQ', title: 'GOODNESS OF GOD 💥 Top Best 50 Gospel Music Lyrics Of All Time 💥 CeCe Winans, Tasha Cobbs', a: 'Black Gospel Music' },
  { g: 'gospel', id: 'uHqvw5NQ69M', title: 'CeCe Winans - Worthy Of It All (Worthy) [Official Music Video]', a: 'CeCe Winans' },
  { g: 'gospel', id: 'ZPHXL8Poku0', title: 'CeCe Winans - Never Lost (Official Lyric Video)', a: 'CeCe Winans' },
  { g: 'gospel', id: 'R41IE3lOt9c', title: 'Mercy Said No', a: 'CeCe Winans' },
  { g: 'gospel', id: 'WuVvhWhRbDI', title: 'Best Playlist Of Fred Hammond Gospel Songs 2022🎹 Most Popular Fred Hammond Songs Of All T', a: 'Gospel Music' },
  { g: 'gospel', id: 'VR48-pL0_-4', title: 'Best Playlist Of Fred Hammond Gospel Songs 2022🎹 Most Popular Fred Hammond Songs Of All T', a: 'Gospel Music' },
  { g: 'gospel', id: 'YeL2Ty3rSM0', title: 'Fred Hammond Top Gospel Music Praise And Worship Songs - Best Gopel Songs', a: 'Gospel Music' },
  { g: 'gospel', id: '-rre_vkDXsg', title: 'Fred Hammond Worship 2', a: 'woomc worship' },
  { g: 'gospel', id: 'KLeFzfP6_I4', title: 'Fred Hammond Worship 1', a: 'woomc worship' },
  { g: 'gospel', id: '1M3g5aGM5A8', title: 'Fred Hammond, Radical For Christ - No Weapon (Lyrics)', a: 'Hip Hop/R&B Lyrics' },
  { g: 'gospel', id: 'JJYFWWcTsr4', title: 'Fred Hammond - No Weapon Formed Against Me Shall Prosper', a: 'BlessedOne400' },
  { g: 'gospel', id: 'WdnHvp0inCw', title: 'Best Playlist Of Fred Hammond Gospel Songs 2022🎹 Most Popular Fred Hammond Songs Of All T', a: 'Top Gospel Music Praise And Worship' },
  { g: 'gospel', id: 'ClFp8yqfokk', title: 'Fred Hammond: Tiny Desk Concert', a: 'NPR Music' },
  { g: 'gospel', id: 'AJ2P_xssl5c', title: 'Fred Hammond, Radical For Christ - You Are The Living Word (Live) [Lyrics]', a: 'Hip Hop/R&B Lyrics' },
  { g: 'gospel', id: 'OyTYEeZdhK8', title: 'Fred Hammond & RFC - You Are the Living Word', a: 'Cheek Life' },
  { g: 'gospel', id: 'T3jLg1oRq6E', title: 'Donnie Mcclurkin - Top Gospel Musics', a: 'Gospel Songs' },
  { g: 'gospel', id: 'tzdQgjKUTwM', title: 'Donnie McClurkin - I Need You (Official Video)', a: 'DonnieMcClurkinShow' },
  { g: 'gospel', id: '8tS_SbvL68c', title: 'That\'s What I Believe', a: 'DonnieMcClurkinShow' },
  { g: 'gospel', id: 'DcKBuFXzLgI', title: 'Full Album of Donnie McClurkin 2024 ~ Top 100 Donnie McClurkin Ever', a: 'Top Songs Playlist' },
  { g: 'gospel', id: 'S0tX_ctp0Gs', title: 'Donnie McClurkin - We Fall Down (Stereo)', a: 'DonnieMcClurkinShow' },
  { g: 'gospel', id: '0KgV_lkRVRI', title: 'Speak To My Heart   Donnie McClurkin', a: 'dmamanoes' },
  { g: 'gospel', id: 'mDAjtI7wGR4', title: 'Stand - Donnie McClurkin, Marvin Winans, & CeCe Winans', a: 'Times Square Church' },
  { g: 'gospel', id: '0I0_e8kFScA', title: 'I Call You Faithful', a: 'DonnieMcClurkinShow' },
  { g: 'gospel', id: 'GnIxpnfE8C0', title: 'Better Afterwhile (Live)', a: 'DonnieMcClurkinShow' },
  { g: 'gospel', id: 'WZMEd-eyaaQ', title: 'Only You Are Holy', a: 'DonnieMcClurkinShow' },
  { g: 'gospel', id: 'BNiKt_5WH-8', title: 'Great Is Thy Faithfulness / Great Is Your Mercy - Donnie McClurkin & CeCe Winans', a: 'Times Square Church' },
  { g: 'gospel', id: '6fGaxufI0kc', title: 'Great is Your Mercy   Donnie McClurkin Gospel Goes classical SA', a: 'JC Omolombi' },
  { g: 'gospel', id: 'yhRsP1ETxcw', title: 'Mary Mary - Top Gospel Music Praise And Worship', a: 'Gospel Songs' },
  { g: 'gospel', id: 'sS5lb0DdtTU', title: 'Mary Mary - Top Gospel Music Praise And Worship', a: 'Gospel Songs' },
  { g: 'gospel', id: 'agxi8cei9h8', title: 'Mary Mary - God in Me (Official Video)', a: 'Mary Mary TV' },
  { g: 'gospel', id: 'ADGnIi9KrLQ', title: 'Mary Mary - Go Get It (Official Video)', a: 'Mary Mary TV' },
  { g: 'gospel', id: 'p-baoSWy8jY', title: 'Mary Mary - Walking (Official Video)', a: 'Mary Mary TV' },
  { g: 'gospel', id: 'PmS4mht8WU0', title: 'Mary Mary - Can\'t Give Up Now (Lyrics)', a: 'Hip Hop/R&B Lyrics' },
  { g: 'gospel', id: '37PCbh9KppA', title: 'Mary Mary-Cant Give Up Now', a: 'Ervin0310' },
  { g: 'gospel', id: 'Q-bDigigBmM', title: 'Mary Mary - Top Gospel Music Praise And Worship - Best Songs Of Mary Mary', a: 'Gospel Songs' },
  { g: 'gospel', id: 'D2oeEgWDQ1c', title: 'Mary Mary - Top Gospel Music Praise And Worship', a: 'Gospel Songs' },
  { g: 'gospel', id: 'Fb8KJ0Evv5k', title: 'Mary Mary - Can\'t Give Up Now', a: 'DanceHype' },
  { g: 'gospel', id: '1xXS7Tlwtdg', title: 'Mary Mary - In The Morning', a: 'Mary Mary TV' },
  { g: 'gospel', id: 'Lgxp5E6aFfk', title: 'Deitrick Haddon, Ruben Studdard, Mary Mary - Love Him Like I Do (Video)', a: 'Ruben Studdard' },
  { g: 'gospel', id: 'PZuxWHUdtLo', title: 'SINACH: The Name of Jesus | Live', a: 'SINACH' },
  { g: 'gospel', id: 'jaZeMDGvrBM', title: 'SINACH: YAHWEH : SINACH FEATURING MAHALIA BUCHANAN (OFFICIAL MUSIC VIDEO)', a: 'SINACH' },
  { g: 'gospel', id: 'Xu6RM5KkaiM', title: 'Sinach - He Did it Again', a: 'SINACH' },
  { g: 'gospel', id: 'znSP3ewg3q4', title: 'SINACH: NO ONE KNOWS (LIVE)', a: 'SINACH' },
  { g: 'gospel', id: 'qZa2Npa6JYE', title: 'SINACH: ARISE FT SISAN DAIBO', a: 'SINACH' },
  { g: 'gospel', id: 'e4bQqjnaxLw', title: 'SINACH: WITH ALL MY HEART', a: 'SINACH' },
  { g: 'gospel', id: 'pIfN9-d1ddM', title: 'SINACH: NO OTHER NAME | OFFICIAL VIDEO', a: 'SINACH' },
  { g: 'gospel', id: 'nuBA5YSsWUI', title: 'SINACH: NOTHING IS IMPOSSIBLE LYRICS VIDEO', a: 'SINACH' },
  { g: 'gospel', id: '4rDZCvX4Df8', title: 'SINACH : DONE IT AGAIN', a: 'SINACH' },
  { g: 'gospel', id: 'w2pHOVKP7xo', title: 'SINACH   WAY MAKER   OFFICIAL VIDEO', a: 'Adorons le SEIGNEUR' },
  { g: 'gospel', id: '8yM3pueaxYE', title: 'SINACH: THE LORD MOST HIGH ', a: 'SINACH' },
  { g: 'gospel', id: 'YlYJMVu1rpQ', title: 'Best Playlist Of Sinach Gospel Songs 2024- Most Popular Sinach Songs Of All Time Playlist', a: 'Hit Songs' },
  { g: 'gospel', id: 'ipSdHFZKF24', title: 'Nathaniel Bassey Best Worship Songs Mix 2022 - Powerful Gospel Worship Songs 2022', a: 'Worship Library' },
  { g: 'gospel', id: 'tpa1t3ZdX4o', title: 'Live Worship Moments with Pastor Nathaniel Bassey — Ese Ese & Imela | Recharge Conference ', a: 'Global Impact Church TV' },
  { g: 'gospel', id: '0f33q6v5CjY', title: 'The Battle Belongs to God (Praise Medley)', a: 'Nathaniel Bassey Main' },
  { g: 'gospel', id: 'girST9ZY6UQ', title: 'PASTOR NATHANIEL BASSEY AT WORSHIP & WARFARE SERVICE MAY 2026  ||17||05||2026', a: 'Koinonia Global' },
  { g: 'gospel', id: 'p7UjfT61ZS4', title: 'THE BATTLE BELONGS TO GOD PRAISE MEDLEY - NATHANIEL BASSEY #nathanielbassey #hallelujahcha', a: 'Nathaniel Bassey Main' },
  { g: 'gospel', id: 'Vf_qHLJsMOM', title: 'Glory to God in the Highest', a: 'Nathaniel Bassey Main' },
  { g: 'gospel', id: '-wuT9VGG1DQ', title: 'GLORY TO GOD IN THE HIGHEST | NATHANIEL BASSEY #nathanielbassey #hallelujahchallenge', a: 'Nathaniel Bassey Main' },
  { g: 'gospel', id: 'JWN9P5dcz2o', title: 'Full Album Nathaniel Bassey Greatest Hits 2026 – Top 20 Nigerian Gospel Worship Songs', a: 'Crimson Lantern Crown' },
  { g: 'gospel', id: 'BEyB8FK2tXc', title: 'NATHANIEL BASSEY’S POWERFUL WORSHIP MOMENTS 🙌 | Sound of Revival 2026', a: 'The Father\'s Table' },
  { g: 'gospel', id: '5taka1Ftu-E', title: 'Yahweh Sabaoth | Nathaniel Bassey', a: 'Nathaniel Bassey Main' },
  { g: 'gospel', id: 'TL-UkMcPQ10', title: 'ONYE KAM GA SI NA OYIRI GI (Who is like unto You) - NATHANIEL BASSEY  #hallelujahchallenge', a: 'Nathaniel Bassey Main' },
  { g: 'gospel', id: 'T0HeDQhfrnE', title: 'A Deep Worship Moment with Pst Nathaniel Bassey', a: 'The Glorious Fountain Ministries' },
  { g: 'gospel', id: 'gnCU8IruUe8', title: 'Minister Dunsin Oyekan | Powerful Warfare Worship at The Potter\'s City | 2 Hours Non-Stop ', a: 'Worship Bus Stop ' },
  { g: 'gospel', id: '_DAJOwDWc0U', title: 'Dunsin Oyekan\'s PROPHETIC WORSHIP & PRAISE at the Throne Room', a: 'RCCG - THE THRONE ROOM' },
  { g: 'gospel', id: 'NZ6oTmngasY', title: 'Who Is Like You? - Dunsin Oyekan', a: 'Dunsin Oyekan' },
  { g: 'gospel', id: 'U3Vokwa1uBA', title: '2 HOURS DEEP WORSHIP 🔥 | Songs & Chants | BBO x Dunsin Oyekan | Powerful Worship Session', a: 'Chanting Chapel ' },
  { g: 'gospel', id: '5dcuPjVHgVQ', title: 'Prophetic Worship Medley & Prayers ft. Dunsin Oyekan, James Aladiran & Matt Varah Wilson', a: 'PrayerStormTV' },
  { g: 'gospel', id: 'mlwwl2_7sCk', title: '1 HOUR POWERFUL AND ELECTRIFYING WORSHIP MINISTRATION || DUNSIN OYEKAN', a: 'Dunsin live ministration (D.l.m)' },
  { g: 'gospel', id: 'lrdmnAn9gxk', title: 'Worthy Of My Praise - Dunsin Oyekan ft  @LawrenceOyor #dunsinoyekan #worship #thegreatcomm', a: 'Dunsin Oyekan' },
  { g: 'gospel', id: 'QprxLgcEB04', title: 'MINISTER DUNSIN OYEKAN AT WORSHIP AND WARFARE SERVICE MARCH 2026 ||15||03||2026', a: 'Koinonia Global' },
  { g: 'gospel', id: 'wsuTtShr768', title: '🔥🔥🔥 INTENSE MOMENT OF DEEP WORSHIP WITH MIN. DUNSIN OYEKAN AND APOSTLE JOSHUA SELMAN ', a: 'KOINONIA WATCH TV' },
  { g: 'gospel', id: 'Q20TFMPXfrE', title: 'Minister Dunsin Oyekan\'s Worship Brought Down God\'s Glory at Throne Worship ', a: 'Worship Bus Stop ' },
  { g: 'gospel', id: 'ja343Erbpq0', title: 'BARUCH HASHEM ADONAI - Dunsin Oyekan ft. @theophilussunday..', a: 'Dunsin Oyekan' },
  { g: 'gospel', id: 'TsIPyhXP8DM', title: 'Mountain Shifting Worship by Dunsin Oyekan | Higher Ground Conference 2026 - Power', a: 'Household of David' },
  { g: 'gospel', id: 'lIGg1oqTBHg', title: 'Lauren Daigle Greatest Hits | Powerful Christian Worship & Soulful Praise Playlist 2025', a: 'Songs In Faith Studios' },
  { g: 'gospel', id: 'A51Escne3Y0', title: 'Best Of Lauren Daigle Full Album Lauren Daigle Greatest Hits 2022   Lauren Daigle Best son', a: 'Praise And Worship' },
  { g: 'gospel', id: 'HFjGnA-g-NI', title: 'New 2024 Best Playlist Of Lauren Daigle Christian Songs 🙏 Ultimate Lauren Daigle Full Alb', a: 'Best Worship Music BWM' },
  { g: 'gospel', id: 'l5EJTxOSqXk', title: 'New 2023 Best Playlist Of Lauren Daigle Christian Songs – Ultimate Lauren Daigle Full Albu', a: 'Hallelujah Harmony' },
  { g: 'gospel', id: 'WNklT3GIOJ0', title: 'New 2023 Best Playlist Of Lauren Daigle Christian Songs 🙏 Ultimate Lauren Daigle Full Alb', a: 'Hallelujah Harmony' },
  { g: 'gospel', id: 'OX6J7Xvxecs', title: 'New Lauren Daigle Christian Worship Songs 2020 🙏 Best Worship Songs Playlist of Lauren Da', a: 'Hit Songs' },
  { g: 'gospel', id: 'zHNcAr13XfU', title: 'New 2024 Best Playlist Of Lauren Daigle Christian Songs 🙏 Ultimate Lauren Daigle Full Alb', a: 'Best Worship Music BWM' },
  { g: 'gospel', id: 'QnsS61YQxWg', title: 'Jamie MacDonald - Desperate (with Lauren Daigle) (Official Performance Video)', a: 'Jamie MacDonald' },
  { g: 'gospel', id: '_4AZzuhkU5g', title: 'Lauren Daigle - You Say (Fun Fact Video)', a: 'Lauren Daigle' },
  { g: 'gospel', id: 'gYR0xP1j4PY', title: 'Lauren Daigle - Rescue (Official Music Video)', a: 'Lauren Daigle' },
  { g: 'gospel', id: 'N4WB0E0TI2c', title: 'Lauren Daigle —   Christian Worship Songs (lyrcs video )', a: 'Praise Protocol' },
  { g: 'gospel', id: 'Wa2xFcOwLRo', title: 'Lauren Daigle 2024 MIX Favorite Songs - First, Hold On To Me, Look Up Child, Rescue', a: 'HELLO YOU' },
  { g: 'hiphop', id: '5SejM_hBvMM', title: 'Juice WRLD -  Lean Wit Me (Official Music Video)', a: 'Juice WRLD' },
  { g: 'hiphop', id: 'cr82wSBZeeQ', title: 'Juice WRLD - Armed & Dangerous (Official Music Video)', a: 'Lyrical Lemonade' },
  { g: 'hiphop', id: 'ghzdwjWrWcc', title: 'Juice WRLD - Bad Boy ft. Young Thug (Official Music Video)', a: 'Lyrical Lemonade' },
  { g: 'hiphop', id: 'HA1srD2DwaI', title: 'Juice WRLD - Burn (Official Music Video)', a: 'Juice WRLD' },
  { g: 'hiphop', id: 'EYygYkYldHw', title: 'Juice WRLD - Glo’d Up (Official Music Video)', a: 'Juice WRLD' },
  { g: 'hiphop', id: 'RRl_C73vFtQ', title: 'Juice WRLD - Black & White', a: 'Juice WRLD' },
  { g: 'hiphop', id: 'JRAdnd3ORXM', title: 'Juice WRLD - Autograph (On My Line) Music Video', a: 'zdogg' },
  { g: 'hiphop', id: '_MUSrN3ACV4', title: 'Juice WRLD - Cuffed (Official Music Video)', a: 'Juice WRLD' },
  { g: 'hiphop', id: 'hgYhws0AHcg', title: 'Juice WRLD - Empty Out Your Pockets (Official Fortnite Video)', a: 'Juice WRLD' },
  { g: 'hiphop', id: 'f74GYIVMk3I', title: 'Juice WRLD - Already Dead (Official Music Video)', a: 'Juice WRLD' },
  { g: 'hiphop', id: '8FCaPKoHR3k', title: 'Juice WRLD - Cigarettes (Official Music Video)', a: 'Juice WRLD' },
  { g: 'hiphop', id: '6WkySwfWh6Y', title: 'Future, Juice WRLD - Realer N Realer (Official Music Video)', a: 'Future' },
  { g: 'hiphop', id: 'SD4yRDY9mek', title: 'Drake - Janice STFU', a: 'Drake' },
  { g: 'hiphop', id: 'bpD-JVy2zV4', title: 'Drake - Burning Bridges', a: 'Drake' },
  { g: 'hiphop', id: 'y56D2WIeKxg', title: 'DRAKE - QUEBEC', a: 'Drake' },
  { g: 'hiphop', id: 'JFm7YDVlqnI', title: 'Drake - Laugh Now Cry Later (Official Music Video) ft. Lil Durk', a: 'Drake' },
  { g: 'hiphop', id: 'cimoNqiulUE', title: 'Drake - Headlines (Explicit)', a: 'Drake' },
  { g: 'hiphop', id: '0KCWqnldEag', title: 'Drake - HYFR (Hell Ya Fucking Right) (Explicit) ft. Lil Wayne', a: 'Drake' },
  { g: 'hiphop', id: 'ipOSrQNrp1U', title: 'Drake, Future, Molly Santana - Ran To Atlanta', a: 'Drake' },
  { g: 'hiphop', id: '9Qpe2qlERWY', title: 'Drake - Dust', a: 'Drake' },
  { g: 'hiphop', id: 'MoR47PedfaU', title: 'Drake - shabang', a: 'Drake' },
  { g: 'hiphop', id: '-zzP29emgpg', title: 'Drake - Take Care ft. Rihanna', a: 'Drake' },
  { g: 'hiphop', id: 'YhUqxWR4mnE', title: 'Drake - Whisper My Name', a: 'Drake' },
  { g: 'hiphop', id: 'Iu9xmEaHwpU', title: 'Drake - Jumbotron Shit Poppin', a: 'Drake' },
  { g: 'hiphop', id: 'fuV4yQWdn_4', title: 'squabble up', a: 'Kendrick Lamar' },
  { g: 'hiphop', id: 'NLZRYQMLDW4', title: 'Kendrick Lamar - DNA.', a: 'Kendrick Lamar' },
  { g: 'hiphop', id: 'QjlFqgRbICY', title: 'Kendrick Lamar - A.D.H.D (Official Video)', a: 'Top Dawg Entertainment' },
  { g: 'hiphop', id: 'zI383uEwA6Q', title: 'Kendrick Lamar - N95', a: 'Kendrick Lamar' },
  { g: 'hiphop', id: 'toBTPGfurLc', title: 'Kendrick Lamar - Rich Spirit', a: 'Kendrick Lamar' },
  { g: 'hiphop', id: 'hRK7PVJFbS8', title: 'Kendrick Lamar - King Kunta', a: 'Kendrick Lamar' },
  { g: 'hiphop', id: 'glaG64Ao7sM', title: 'Kendrick Lamar - ELEMENT.', a: 'Kendrick Lamar' },
  { g: 'hiphop', id: 'ox7RsX1Ee34', title: 'Kendrick Lamar - LOVE. ft. Zacari', a: 'Kendrick Lamar' },
  { g: 'hiphop', id: 'v6HBZC9pZHQ', title: 'Baby Keem, Kendrick Lamar - family ties (Official Video)', a: 'Baby Keem' },
  { g: 'hiphop', id: 'Dlh-dzB2U4Y', title: 'Kendrick Lamar - LOYALTY. ft. Rihanna', a: 'Kendrick Lamar' },
  { g: 'hiphop', id: '5GhhVHpPR_M', title: 'Kendrick Lamar - Count Me Out', a: 'Kendrick Lamar' },
  { g: 'hiphop', id: 'GF8aaTu2kg0', title: 'Kendrick Lamar - Bitch, Don\'t Kill My Vibe (Explicit)', a: 'Kendrick Lamar' },
  { g: 'hiphop', id: 'X7aF3nZOS98', title: 'Travis Scott - I KNOW ? (Official Music Video)', a: 'Travis Scott' },
  { g: 'hiphop', id: 'qAlF70MdfwU', title: 'JACKBOYS & Travis Scott feat. Young Thug - OUT WEST (Official Music Video)', a: 'Travis Scott' },
  { g: 'hiphop', id: '_VRyoaNF9sk', title: 'Travis Scott feat. Young Thug & M.I.A. - FRANCHISE (Official Music Video)', a: 'Travis Scott' },
  { g: 'hiphop', id: '8G8Fn0YRjvM', title: 'Travis Scott - DUMBO', a: 'Travis Scott' },
  { g: 'hiphop', id: 'KPz33BLkvho', title: 'Travis Scott - ESCAPE PLAN (Official Music Video)', a: 'Travis Scott' },
  { g: 'hiphop', id: '2LegcNVM_nM', title: 'Travis Scott - CAN\'T SAY (Official Video)', a: 'Travis Scott' },
  { g: 'hiphop', id: 'leJNDpm_G10', title: 'Young Thug - Hot ft. Gunna & Travis Scott [Official Music Video]', a: 'Young Thug' },
  { g: 'hiphop', id: 'kx7P_ENnDPE', title: 'JACKBOYS, Pop Smoke, Travis Scott - GATTI (Official Music Video)', a: 'Travis Scott' },
  { g: 'hiphop', id: 'PJWHAiDARMQ', title: 'Travis Scott - YOSEMITE (Official Video)', a: 'Travis Scott' },
  { g: 'hiphop', id: 'BuNBLjJzRoo', title: 'Travis Scott - 90210 (Official Video) ft. Kacy Hill', a: 'Travis Scott' },
  { g: 'hiphop', id: 'iQhLccjeHYI', title: 'Travi$ Scott - Don\'t Play (Official Video) ft. Big Sean, The 1975', a: 'Travis Scott' },
  { g: 'hiphop', id: 'zmFm9Yp80dE', title: 'Travis Scott - beibs in the trap (Official Video) ft. NAV', a: 'Travis Scott' },
  { g: 'hiphop', id: 'BBYdzzyWhTU', title: 'Lil Baby - Aint Goin (Official Music Video)', a: 'Lil Baby Official ' },
  { g: 'hiphop', id: 'PXxbEfhtDiM', title: 'Lil Baby - Dead Fresh (Official Video)', a: 'Lil Baby Official ' },
  { g: 'hiphop', id: '3EeJub4m1-E', title: 'Lil Baby - Mr. Do Something', a: 'Lil Baby Official ' },
  { g: 'hiphop', id: '4F_vcZ6KD9Q', title: 'Lil Baby - In A Minute (Official Video)', a: 'Lil Baby Official ' },
  { g: 'hiphop', id: 'MHryuYVyHhk', title: 'Lil Baby "Freestyle" Official Music Video', a: 'Lil Baby Official ' },
  { g: 'hiphop', id: '_VDGysJGNoI', title: 'Lil Baby - The Bigger Picture (Official Music Video)', a: 'Lil Baby Official ' },
  { g: 'hiphop', id: 'WyhU6Zb_fhY', title: 'Lil Baby - California Breeze (Official Video)', a: 'Lil Baby Official ' },
  { g: 'hiphop', id: 'nUEqPtVGIpE', title: 'Lil Baby - Woah (Official Music Video)', a: 'Lil Baby Official ' },
  { g: 'hiphop', id: 'd-2KRSezHb0', title: 'Lil Baby "Southside" (WSHH Exclusive - Official Music Video)', a: 'WORLDSTARHIPHOP' },
  { g: 'hiphop', id: 'GErG9femMQk', title: 'Lil Baby x 42 Dugg - We Paid (Official Video)', a: 'Lil Baby Official ' },
  { g: 'hiphop', id: 'IixEG5N0GdE', title: 'Lil Baby - Pure Cocaine (Official Music Video)', a: 'Lil Baby Official ' },
  { g: 'hiphop', id: 'iXUPeEuM1CM', title: 'Lil Baby - Emotionally Scarred', a: 'Lil Baby Official ' },
  { g: 'hiphop', id: 'f6ZDmAhaH_Q', title: 'Future - Konnichiwa (Official Music Video)', a: 'Future' },
  { g: 'hiphop', id: '6OxmafNPn3o', title: 'Future - LIL DEMON (Official Music Video)', a: 'Future' },
  { g: 'hiphop', id: 'Sh4pJYJOT7M', title: 'Future ft. Drake, Travis Scott & Loe Shimmy - Ya Hit (Official Music Video)', a: 'Future and 2 more' },
  { g: 'hiphop', id: 'MXGORPXI6QQ', title: 'Future - Stick Talk (Official Music Video)', a: 'Future' },
  { g: 'hiphop', id: '-NKqonGjL6E', title: 'Future - No Misery (Official Music Video)', a: 'Future' },
  { g: 'hiphop', id: 'owxHUouEIBU', title: 'Future - California Girls (Official Music Video)', a: 'Future' },
  { g: 'hiphop', id: '3gt-rxxs-RQ', title: 'Future - Wicked (Official Music Video)', a: 'Future' },
  { g: 'hiphop', id: 'OSxyaNqmib4', title: 'Future - TOLD MY (Official Music Video)', a: 'Future' },
  { g: 'hiphop', id: 'G8w42dfxNg8', title: 'Future - BACK TO THE BASICS (Official Music Video)', a: 'Future' },
  { g: 'hiphop', id: 'nNS3ye93eZA', title: 'Future - Never Stop (Official Music Video)', a: 'Future' },
  { g: 'hiphop', id: '9qWaO-h7K8k', title: 'Future - Build a B*tch (Official Music Video)', a: 'Lyrical Lemonade and Future' },
  { g: 'hiphop', id: 'ufWyjtt7A84', title: 'Future - BRAZZIER (Official Music Video)', a: 'Future' },
  { g: 'hiphop', id: 'NyTkaQHdySM', title: 'Metro Boomin, Don Toliver, Future - Too Many Nights (Official Video)', a: 'Metro Boomin' },
  { g: 'hiphop', id: '_WCD3Z9UmJ4', title: 'Metro Boomin & Future - Superhero (Heroes & Villains) [Official Music Video]', a: 'Metro Boomin' },
  { g: 'hiphop', id: 'I0fgkcTbBoI', title: 'Future, Metro Boomin, Travis Scott, Playboi Carti - Type Shit (Official Video)', a: 'Future' },
  { g: 'hiphop', id: 'Zc5Kc9HxplI', title: 'Metro Boomin, Travis Scott & Young Thug - Trance (Official Music Video)', a: 'Jh56' },
  { g: 'hiphop', id: '-kSAvHlXRUs', title: 'Future, Metro Boomin, The Weeknd - Young Metro (Official Music Video)', a: 'Future' },
  { g: 'hiphop', id: 'LPTlvQ1Zet0', title: '21 Savage, Offset, Metro Boomin - Ric Flair Drip (Official Music Video)', a: '21 Savage' },
  { g: 'hiphop', id: 'qBWhc4qbsjo', title: 'Metro Boomin - Space Cadet ft. Gunna', a: 'Metro Boomin' },
  { g: 'hiphop', id: 'M7zTWKJsdNY', title: 'Metro Boomin, Travis Porter, Young Dro, Gucci Mane - They Wanna Have Fun (Official Music V', a: 'Metro Boomin' },
  { g: 'hiphop', id: 'uI29qCR9PGk', title: 'Metro Boomin - Heroes & Villains (Short Film)', a: 'Metro Boomin' },
  { g: 'hiphop', id: 'ZZ6VhTBcc-c', title: '21 Savage x Metro Boomin - Runnin (Official Music Video)', a: '21 Savage' },
  { g: 'hiphop', id: 'SpXw0qiy3Wo', title: '21 Savage & Metro Boomin - X ft Future (Official Music Video)', a: '21 Savage' },
  { g: 'hiphop', id: 'ydIB7oIWNPE', title: 'NAV, Metro Boomin - Call Me', a: 'NAV' },
  { g: 'hiphop', id: '6wtwpUwxQik', title: '21 Savage & Metro Boomin - No Heart (Official Music Video)', a: '21 Savage' },
  { g: 'hiphop', id: 'pGsetzZscws', title: 'Young Nudy - Peaches & Eggplants (Official Video) ft. 21 Savage', a: 'Young Nudy' },
  { g: 'hiphop', id: 'U4mADkt6o-M', title: '21 Savage - redrum (Official Music Video)', a: '21 Savage' },
  { g: 'hiphop', id: '_4gUVl5pjps', title: '21 Savage - ball w/o you (Official Video)', a: '21 Savage' },
  { g: 'hiphop', id: 'acYUqMd9k2I', title: '21 Savage & Metro Boomin - Glock In My Lap (Official Music Video)', a: '21 Savage' },
  { g: 'hiphop', id: '1NCqFBl5-OY', title: '21 Savage - Million Dollar Liq ft. ManMan Savage (prod. by Fukk 12)', a: '21 Savage' },
  { g: 'hiphop', id: 'mWISiHcGoNg', title: '21 Savage - Red Opps (Official Video) Shot By @AZaeProduction', a: 'A Zae Production' },
  { g: 'hiphop', id: '1r8BcVqXKlQ', title: '21 Savage - All The Smoke (Official Music Video)', a: '21 Savage' },
  { g: 'hiphop', id: 'H1KBHFXm2Bg', title: '21 Savage - Bank Account (Official Music Video)', a: '21 Savage' },
  { g: 'hiphop', id: 'xxFjwI1qYmc', title: 'Belly Gang Kushington - WTF GOIN (Official Music Video) ft. 21 Savage', a: 'Belly Gang Kushington  and 21 Savage' },
  { g: 'hiphop', id: 'KQhD6izHFgg', title: '21 Savage - Dip Dip (Official Music Video)', a: '21 Savage' },
  { g: 'hiphop', id: 'hJBAzPsLZ00', title: '21 Savage x Young Nudy - Since When (Official Music Video)', a: '21 Savage' },
  { g: 'hiphop', id: 'L-kL_BGwYlM', title: 'Rod Wave - Mainstay Ft. Luv Von (Official Music Video)', a: 'RodWave' },
  { g: 'hiphop', id: '9d6cbYircbQ', title: 'Rod Wave - Hustle (Official Music Video)', a: 'RodWave' },
  { g: 'hiphop', id: 'y7394ESN91Y', title: 'Rod Wave - By Your Side (Official Video)', a: 'RodWave' },
  { g: 'hiphop', id: 'NCkIbF6OhGs', title: 'Rod Wave - Leavin (Official Music Video)', a: 'RodWave' },
  { g: 'hiphop', id: 'EYcLEizR_fM', title: 'Rod Wave - Passport Junkie (Official Video)', a: 'RodWave' },
  { g: 'hiphop', id: 'CVE-nY81mSE', title: 'Rod Wave - Cold December (Official Video)', a: 'RodWave' },
  { g: 'hiphop', id: 'AeaR5QbXgpM', title: 'Rod Wave - Street Runner (Official Video)', a: 'RodWave' },
  { g: 'hiphop', id: 'kC8YEw9h2-Q', title: 'Rod Wave - Call Your Friends (Official Video)', a: 'RodWave' },
  { g: 'hiphop', id: 'LY4uMLgdvyE', title: 'Rod Wave - Forever Set In Stone (Official Video)', a: 'RodWave' },
  { g: 'hiphop', id: 'yKr563bkO0E', title: 'Rod Wave - Feed The Streets (Official Music Video)', a: 'RodWave' },
  { g: 'hiphop', id: '6dW4d0IcQ3k', title: 'Rod Wave - Fight The Feeling (Official Video)', a: 'RodWave' },
  { g: 'hiphop', id: 'WO-jOWpwkk4', title: 'Rod Wave - The Greatest (Official Music Video)', a: 'RodWave' },
  { g: 'hiphop', id: 'fPmllLdiZCQ', title: 'Don Toliver - Party With The Boys [Official Video]', a: 'Don Toliver' },
  { g: 'hiphop', id: '2ub5lOODSD4', title: 'Loe Shimmy & Don Toliver - 3am (Official Music Video)', a: 'Loe Shimmy' },
  { g: 'hiphop', id: 'KlhuSz0HbcE', title: 'Don Toliver - Tiramisu [Official Music Video]', a: 'Don Toliver' },
  { g: 'hiphop', id: 'A5mURRozXtg', title: 'Don Toliver - No Pole [Official Music Video]', a: 'Don Toliver' },
  { g: 'hiphop', id: '_SrosL0WdOQ', title: 'Don Toliver - Excavator [Official Video]', a: 'Don Toliver' },
  { g: 'hiphop', id: 'iUFlb4YYYKo', title: 'Don Toliver - ATM [Official Video]', a: 'Don Toliver' },
  { g: 'hiphop', id: 'gB_1xE23gb4', title: 'Don Toliver - Flocky Flocky (feat. Travis Scott) [Official Music Video]', a: 'Don Toliver' },
  { g: 'hiphop', id: '7GwLnsVUwHY', title: 'Don Toliver - E85 [Official Visualizer]', a: 'Don Toliver' },
  { g: 'hiphop', id: 'l8SlIEh-Je8', title: 'Don Toliver - K9 (feat. SahBabii) [Official Video]', a: 'Don Toliver' },
  { g: 'hiphop', id: '7WLt74z_TkI', title: 'Don Toliver - Cardigan [Official Music Video]', a: 'Don Toliver' },
  { g: 'hiphop', id: '4IahvCIqeOc', title: 'Don Toliver - After Party [Official Music Video]', a: 'Don Toliver' },
  { g: 'hiphop', id: 'PvtQwxZJmL8', title: 'Don Toliver - TORE UP [Official Music Video]', a: 'Don Toliver' },
  { g: 'hiphop', id: 'icoOOiSlKK0', title: 'Tyler, The Creator - JUGGERNAUT (Official Video)', a: 'Tyler, The Creator' },
  { g: 'hiphop', id: 'a5JCltuobqQ', title: 'Tyler, The Creator - LEMONHEAD (Official Video)', a: 'Tyler, The Creator' },
  { g: 'hiphop', id: '_RuuRU0bGLc', title: 'THOUGHT I WAS DEAD', a: 'Tyler, The Creator' },
  { g: 'hiphop', id: 'mFNaFeIm4bU', title: 'Tyler The Creator - She (feat. Frank Ocean)', a: 'OFWGKTA' },
  { g: 'hiphop', id: 'R4Y7JIQlv20', title: 'Tyler, The Creator - LUMBERJACK (Official Video)', a: 'Tyler, The Creator' },
  { g: 'hiphop', id: 'ljHdccyQbT4', title: 'SUGAR ON MY TONGUE (Official Video)', a: 'Tyler, The Creator' },
  { g: 'hiphop', id: 'NJea386275c', title: 'Tyler, The Creator - WUSYANAME (Official Video)', a: 'Tyler, The Creator' },
  { g: 'hiphop', id: 'tX7RDvVkxzU', title: 'Clipse, Tyler, The Creator, Pusha T, Malice - P.O.V. (Official Music Video)', a: 'Lyrical Lemonade and 3 more' },
  { g: 'hiphop', id: 'gkZ4dLMH-B8', title: 'ST. CHROMA', a: 'Tyler, The Creator' },
  { g: 'hiphop', id: 'FUXX55WqYZs', title: 'Tyler, The Creator - Who Dat Boy', a: 'Tyler, The Creator' },
  { g: 'hiphop', id: 'XSbZidsgMfw', title: 'Tyler The Creator - Yonkers', a: 'OFWGKTA' },
  { g: 'hiphop', id: 'pmlqEKklWqs', title: 'STOP PLAYING WITH ME (Official Video)', a: 'Tyler, The Creator' },
  { g: 'hiphop', id: 'BBAtAM7vtgc', title: 'Kanye West - Bound 2', a: 'Kanye West' },
  { g: 'hiphop', id: 'ila-hAUXR5U', title: 'Kanye West - Flashing Lights ft. Dwele', a: 'Kanye West' },
  { g: 'hiphop', id: 'LQ488QrqGE4', title: 'Kanye West - Homecoming', a: 'Kanye West' },
  { g: 'hiphop', id: 'Co0tTeuUVhU', title: 'Kanye West - Heartless', a: 'Kanye West' },
  { g: 'hiphop', id: 'IxGvm6btP1A', title: 'Kanye West - Fade (Explicit)', a: 'Kanye West' },
  { g: 'hiphop', id: 'BoEKWtgJQAU', title: 'JAŸ-Z, Kanye West - Otis ft. Otis Redding', a: 'Kanye West' },
  { g: 'hiphop', id: '8kyWDhB_QeI', title: 'Kanye West - All Falls Down ft. Syleena Johnson', a: 'Kanye West' },
  { g: 'hiphop', id: 'GG5cE14G2Gg', title: 'Kanye West - Flashing Lights (Director\'s Cut) ft. Dwele', a: 'Kanye West' },
  { g: 'hiphop', id: 'FJt7gNi3Nr4', title: 'Jay-Z & Kanye West - No Church In The Wild ft. Frank Ocean, The-Dream', a: 'Kanye West' },
  { g: 'hiphop', id: '7Dqgr0wNyPo', title: 'Kanye West - Mercy (Explicit) ft. Big Sean, Pusha T, 2 Chainz', a: 'Kanye West' },
  { g: 'hiphop', id: 'MKM90u7pf3U', title: 'Kanye West - Closed On Sunday (Official Video)', a: 'Kanye West' },
  { g: 'hiphop', id: 'WgAPhtNgO5s', title: 'KanyeWest - Bound 2 [Music Video]', a: 'Kanye West' },
  { g: 'hiphop', id: 'gMq-I0dejjE', title: 'Ice Spice & Nicki Minaj - Princess Diana (Official Music Video)', a: 'Ice Spice' },
  { g: 'hiphop', id: 'LDZX4ooRsWs', title: 'Nicki Minaj - Anaconda', a: 'Nicki Minaj' },
  { g: 'hiphop', id: 'j5uAR9w7LBg', title: 'Nicki Minaj - Super Freaky Girl (Official Music Video)', a: 'Nicki Minaj' },
  { g: 'hiphop', id: 'pSFyrrhKj1Q', title: 'Nicki Minaj - Your Love (Official Video)', a: 'Nicki Minaj' },
  { g: 'hiphop', id: 'iKk94CzHz50', title: 'Nicki Minaj - Did It On Em (Explicit) (Official Video)', a: 'Nicki Minaj' },
  { g: 'hiphop', id: 'CUj2AWEJnwQ', title: 'Nicki Minaj & Ice Spice – Barbie World (with Aqua) [Official Music Video]', a: 'Nicki Minaj' },
  { g: 'hiphop', id: 'fwQ8MpwB-Pw', title: 'Nicki Minaj - Super Bass (Edited)', a: 'Nicki Minaj' },
  { g: 'hiphop', id: 'M8GX0cZ-xtw', title: 'Nicki Minaj - Good Form ft. Lil Wayne', a: 'Nicki Minaj' },
  { g: 'hiphop', id: 'he3DJLXbebI', title: 'Nicki Minaj - Right By My Side (Official Music Video) ft. Chris Brown', a: 'Nicki Minaj' },
  { g: 'hiphop', id: 'xzXDSWz3Nbw', title: 'Nicki Minaj - Did It On Em (Clean) (Official Video)', a: 'Nicki Minaj' },
  { g: 'hiphop', id: 'Ks3_kuRAzHs', title: 'Nicki Minaj - Moment 4 Life (Remastered) (Official Video) ft. Drake', a: 'Nicki Minaj' },
  { g: 'hiphop', id: '5FJO6b8GL3M', title: 'Nicki Minaj - Right Thru Me (Clean) (Official Video)', a: 'Nicki Minaj' },
  { g: 'hiphop', id: 'I-5e_J3LWS8', title: 'Cardi B - AH HA [Official Music Video]', a: 'Cardi B' },
  { g: 'hiphop', id: 'hsm4poTWjMs', title: 'Cardi B - WAP feat. Megan Thee Stallion [Official Music Video]', a: 'Cardi B' },
  { g: 'hiphop', id: 'GcNC7YnlhKc', title: 'Cardi B - Like What (Freestyle)  [Official Music Video]', a: 'Cardi B' },
  { g: 'hiphop', id: 'zUOh09GoQgk', title: 'Cardi B - Money [Official Music Video]', a: 'Cardi B' },
  { g: 'hiphop', id: 'narFtb5tdTQ', title: 'Cardi B - Enough (Miami) [Official Music Video]', a: 'Cardi B' },
  { g: 'hiphop', id: 'Ux1f1Q8Zxhk', title: 'Cardi B - Bongos (feat. Megan Thee Stallion) [Official Music Video]', a: 'Cardi B' },
  { g: 'hiphop', id: 'rCiBgLOcuKU', title: 'Cardi B - Up [Official Music Video]', a: 'Cardi B' },
  { g: 'hiphop', id: '-WtNCR3EDS4', title: 'Latto - Put It On Da Floor Again (Official Video) ft. Cardi B', a: 'Latto' },
  { g: 'hiphop', id: 'E_0y8bmIATM', title: 'Cardi B - Safe (feat. Kehlani) [Official Music Video]', a: 'Cardi B' },
  { g: 'hiphop', id: 'QryoOF5jEbc', title: 'City Girls - Twerk ft. Cardi B (Official Music Video)', a: 'City Girls' },
  { g: 'hiphop', id: 'cg2MY3F2iAk', title: 'Cardi B - Imaginary Playerz [Official Music Video]', a: 'Cardi B' },
  { g: 'hiphop', id: 'cJc7xWJbwJw', title: 'Cardi B - Press [Official Music Video]', a: 'Cardi B' },
  /* —— Requested fixups —— */
  { g: 'afrobeat', id: 'jodJzaVZfj8', title: 'Pilé', a: 'Mauvais Djo' },
  { g: 'gospel', id: '-yGJGZ44Otw', title: 'Pilé (Gospel Version)', a: 'Mauvais Djo & Kano Choir' },
  { g: 'movies', id: 'xAgUYyosqVM', title: 'Love Is A Long Road (GTA VI)', a: 'Tom Petty' },
  { g: 'movies', id: '7LEgcd9RD8k', title: 'GTA VI — Love Is A Long Road', a: 'Tom Petty' },
  { g: 'movies', id: 's6EFp4Nwonw', title: 'Come What May', a: 'Nicole Kidman & Ewan McGregor' },
  { g: 'movies', id: '2lGP78ckF_Q', title: 'Come What May (Moulin Rouge)', a: 'Ewan McGregor & Nicole Kidman' },
  /* —— Empire / BigX / XXX / genre pack —— */
  { g: 'electronic', id: 'eimgRedLkkU', title: 'Walking On A Dream', a: 'Empire of the Sun' },
  { g: 'hiphop', id: '3QwZjhHcLZk', title: 'The Largest', a: 'BigXthaPlug' },
  { g: 'hiphop', id: 'x_WayannFys', title: 'Mmhmm', a: 'BigXthaPlug' },
  { g: 'hiphop', id: 'begbi44ZLqw', title: 'Change Me', a: 'BigXthaPlug' },
  { g: 'hiphop', id: 'JVDUsaqgSq0', title: '2AM', a: 'BigXthaPlug' },
  { g: 'hiphop', id: 'EQEYX2n1eKw', title: 'State Made', a: 'BigXthaPlug' },
  { g: 'hiphop', id: 'xQmDjrEOXU8', title: 'Home', a: 'BigXthaPlug' },
  { g: 'hiphop', id: 'hX0aI5Jz8i8', title: 'Texas', a: 'BigXthaPlug' },
  { g: 'hiphop', id: '-KjOMY_zxrA', title: 'Cold', a: 'BigXthaPlug' },
  { g: 'hiphop', id: 'Z7MAZ-91b6Y', title: 'CRACCED', a: 'BigXthaPlug' },
  { g: 'hiphop', id: 'iAeYPfrXwk4', title: 'SAD!', a: 'XXXTENTACION' },
  { g: 'hiphop', id: 'GX8Hg6kWQYI', title: 'Moonlight', a: 'XXXTENTACION' },
  { g: 'hiphop', id: 'qku2WZ7aRYw', title: 'Look At Me!', a: 'XXXTENTACION' },
  { g: 'hiphop', id: 'FAucVNRx_mU', title: 'Jocelyn Flores', a: 'XXXTENTACION' },
  { g: 'hiphop', id: 'f0bbDFRYD_A', title: 'changes', a: 'XXXTENTACION' },
  { g: 'hiphop', id: 'CD_tD26E7k0', title: 'Revenge', a: 'XXXTENTACION' },
  { g: 'hiphop', id: 'DW3tI9HCslo', title: 'SAD! (Alt Video)', a: 'XXXTENTACION' },
  { g: 'electronic', id: 'SP6d5zyWdIo', title: 'Walking On A Dream (Lyrics)', a: 'Empire of the Sun' },
  { g: 'electronic', id: 'V1bFr2SWP1I', title: 'We Are The People', a: 'Empire of the Sun' },
  /* —— Papaoutai / Young Black & Rich / genre pack —— */
  { g: 'pop', id: 'oiKj0Z_Xnjc', title: 'papaoutai', a: 'Stromae' },
  { g: 'pop', id: 'GgN17pQ2EPg', title: 'PAPAOUTAI (Official)', a: 'Stromae' },
  { g: 'hiphop', id: 'F3qWBh7jZZ0', title: 'Young Black & Rich', a: 'Melly Mike' },
  { g: 'afrobeat', id: 'JRF_sdTXpGw', title: 'Active', a: 'Asake & Travis Scott' },
  { g: 'afrobeat', id: 'MCMyKcUNR8w', title: 'WHY LOVE', a: 'Asake' },
  { g: 'pop', id: 'aSugSGCC12I', title: 'Manchild', a: 'Sabrina Carpenter' },
  { g: 'pop', id: 'o3mP3mJDL2k', title: 'tous les mêmes', a: 'Stromae' },
  /* —— More rap/pop/afrobeat —— */
  { g: 'pop', id: 'VHoT4N43jK8', title: 'Alors on danse', a: 'Stromae' },
  { g: 'hiphop', id: 'UjtOGPJ0URM', title: 'Type Shit', a: 'Future & Metro Boomin' },
  { g: 'afrobeat', id: 'yEDHimUB4A4', title: 'Active (Alt)', a: 'Asake ft. Rema & Travis Scott' },
  { g: 'afrobeat', id: 'E6WCzrW_2i4', title: 'Gratitude', a: 'Asake' },
  { g: 'afrobeat', id: 'rkSCar68rYk', title: 'HALLELUJAH', a: 'Rema' },
  /* —— Genre continue pack —— */
  { g: 'pop', id: '51zjlMhdSTE', title: 'Espresso (Official Audio)', a: 'Sabrina Carpenter' },
  { g: 'hiphop', id: 'T6eK-2OQtew', title: 'Not Like Us (Audio)', a: 'Kendrick Lamar' },
  /* —— User list Nov 2026 (dupes → similar alts) —— */
  { g: 'hiphop', id: '0opZqh_TprM', title: 'Lemonade', a: 'Internet Money, Gunna & Don Toliver ft. NAV' },
  { g: 'hiphop', id: 'S4asq3SicN0', title: 'Goodbyes', a: 'Post Malone ft. Young Thug' },
  { g: 'electronic', id: 'AtKZKl7Bgu0', title: 'I Need Your Love', a: 'Calvin Harris ft. Ellie Goulding' },
  { g: 'electronic', id: 'n4RjJKxsamQ', title: 'Save The World', a: 'Swedish House Mafia' },
  { g: 'hiphop', id: 'Jpp4pu1e0ws', title: 'Pop It', a: 'Gunna' },
  { g: 'pop', id: 'T3E9Wjbq44E', title: 'Stereo Hearts', a: 'Gym Class Heroes ft. Adam Levine' },
  { g: 'afrobeat', id: '_aLdw-jBdiw', title: 'Tigini', a: 'Kikimoteleba' },
  { g: 'hiphop', id: 'Om0rYw6qzb8', title: 'Hotel Lobby', a: 'Quavo & Takeoff' },
  { g: 'hiphop', id: '9hJ8lLNWrM4', title: 'Pure Water', a: 'Mustard & Migos' },
  { g: 'pop', id: 'WTJSt4wP2ME', title: 'Wavin\' Flag', a: 'K\'NAAN' },
  { g: 'classics', id: 'wp43OdtAAkM', title: 'Running Up That Hill', a: 'Kate Bush' },
  { g: 'hiphop', id: '2a8PgqWrc_4', title: 'STARGAZING', a: 'Travis Scott' },
  { g: 'hiphop', id: 'Kbj2Zss-5GY', title: 'Praise The Lord (Da Shine)', a: 'A$AP Rocky ft. Skepta' },
  { g: 'hiphop', id: '_VuJA-VQRcY', title: 'Doja', a: 'Central Cee' },
  { g: 'classics', id: 'QNJL6nfu__Q', title: 'They Don\'t Care About Us', a: 'Michael Jackson' },
  { g: 'hiphop', id: 'h4UqMyldS7Q', title: 'It Was a Good Day', a: 'Ice Cube' },
  { g: 'pop', id: 'UrGS_6_HglU', title: 'Control', a: 'Zoe Wees' },
  { g: 'pop', id: 'bg1sT4ILG0w', title: 'Am I Wrong', a: 'Nico & Vinz' },
  { g: 'hiphop', id: 'SQCSxqScSVQ', title: 'Gangsta\'s Paradise', a: 'Coolio ft. L.V.' },
  { g: 'rock', id: 'VPRjCeoBqrI', title: 'A Sky Full of Stars', a: 'Coldplay' },
  { g: 'hiphop', id: 'Z4N8lzKNfy4', title: 'All My Life', a: 'Lil Durk ft. J. Cole' },
  { g: 'hiphop', id: 'vx4kLgnFexo', title: 'Pop Out', a: 'Polo G ft. Lil Tjay' },
  /* —— User list pass 2 —— */
  { g: 'soul', id: 'lXYq9ImJIN8', title: 'Break From Toronto', a: 'PARTYNEXTDOOR' },
  { g: 'hiphop', id: 'V6ZsXKE8QmQ', title: 'fukumean', a: 'Gunna' },
  /* —— User list pass 3 —— */
  { g: 'electronic', id: 'S63YRJpD660', title: 'This Is What It Feels Like', a: 'Armin van Buuren ft. Trevor Guthrie' },

  { g: 'classics', id: 't1TcDHrkQYg', title: 'Forever Young', a: 'Alphaville' },
  /* —— User list pass 4 —— */

  { g: 'pop', id: 'HBxt_v0WF6Y', title: 'Where Have You Been', a: 'Rihanna' },
  { g: 'electronic', id: 'dLa_ryRjC7M', title: 'If I Lose Myself', a: 'OneRepublic & Alesso' },
  { g: 'soul', id: 'i2OJUQZuUWI', title: 'Some of Your Love', a: 'PARTYNEXTDOOR' },
  { g: 'soul', id: 'QHx1-CM1nvk', title: 'Dreamin / Come and See Me', a: 'PARTYNEXTDOOR' },
  { g: 'hiphop', id: '5i0GKTp8c1Q', title: 'on one tonight', a: 'Gunna' },

  { g: 'electronic', id: 'lAwYodrBr2Q', title: 'Wait', a: 'M83' },
  { g: 'electronic', id: '1cEy4UyYHI0', title: 'Outro', a: 'M83' },
  { g: 'pop', id: 'd_HlPboLRL8', title: 'Runaway', a: 'AURORA' },
  { g: 'afrobeat', id: '2NTrT3D2VBo', title: 'Voodoo', a: 'Chisway ft. JZyNo' },
  /* —— User list pass 5 —— */
  { g: 'electronic', id: 'GuAtcpFQpMw', title: 'Reload', a: 'Sebastian Ingrosso, Tommy Trash & John Martin' },
  { g: 'electronic', id: '9G1I16gJBvU', title: 'Calling (Lose My Mind)', a: 'Sebastian Ingrosso, Alesso & Ryan Tedder' },
  { g: 'hiphop', id: 'Tqjw-H4QyG0', title: 'prada dem', a: 'Gunna ft. Offset' },
  { g: 'electronic', id: 'K4DyBUG242c', title: 'On & On', a: 'Cartoon, Jéja ft. Daniel Levi' },
  { g: 'pop', id: '0GnA8VYOfko', title: 'Gut Genug', a: 'KitschKrieg, Blumengarten & Shirin David' },
  { g: 'afrobeat', id: '3QWCjiZSdGQ', title: 'Dimension', a: 'JAE5 ft. Skepta & Rema' },
  { g: 'hiphop', id: 'MQOG5BkY2Bc', title: 'Shutdown', a: 'Skepta' },
  { g: 'electronic', id: 'jUe8uoKdHao', title: 'Without You', a: 'David Guetta ft. Usher' },
  { g: 'hiphop', id: 'QW29Ly55Kvs', title: 'Plot Twist', a: 'Drake' },
  { g: 'hiphop', id: 'bueFTrwHFEs', title: 'Check Yo Self', a: 'Ice Cube' },
  { g: 'hiphop', id: 'rzRqEWJYwX4', title: 'You Know How We Do It', a: 'Ice Cube' },
  { g: 'hiphop', id: 'EfHNIPXTxy0', title: 'ZEZE', a: 'Kodak Black ft. Travis Scott & Offset' },
  { g: 'afrobeat', id: '-a48wndV45g', title: 'Ameyatchi', a: 'Mathey' },
  { g: 'afrobeat', id: 'oL_g56WroqE', title: 'Burukutu', a: 'Olamide' },
  { g: 'afrobeat', id: 'SFmZKO35SfQ', title: 'Bobo', a: 'Olamide' },
  { g: 'afrobeat', id: 'j2u5Gbadn7o', title: 'Wo!', a: 'Olamide' },
  { g: 'afrobeat', id: 'SiQpc5dWsjg', title: 'Melo Melo', a: 'Olamide' },
  { g: 'afrobeat', id: 'gvv1jOFMyNg', title: 'If Love Is A Crime', a: '2Baba ft. VIP' },
  { g: 'hiphop', id: 'PvOYrm_JZc8', title: 'What Happened to Virgil', a: 'Lil Durk ft. Gunna' },
  { g: 'hiphop', id: 'Ty-CHgmCeKw', title: 'Backdoor', a: 'Lil Durk' },
  { g: 'hiphop', id: 'C-DfE1GTRx0', title: '3 Headed Goat', a: 'Lil Durk ft. Lil Baby & Polo G' },
  { g: 'hiphop', id: 'YNyFAro1E5M', title: 'Martin & Gina', a: 'Polo G' },
  { g: 'hiphop', id: 'w2IhccXakkE', title: 'RAPSTAR', a: 'Polo G' },
  { g: 'afrobeat', id: 'WQFDWM-6ytA', title: 'My Darling', a: 'Chella' },
  { g: 'afrobeat', id: 'fLMSd1UM3aA', title: 'Iweriwe Love', a: 'Chella' },
  /* —— User list pass 6 —— */


  /* —— User list pass 7 —— */
  { g: 'afrobeat', id: '7bO6jpdmC-o', title: 'Loyal', a: 'Chella' },

  /* —— User list pass 8 —— */

  { g: 'afrobeat', id: 'DR5dPcoIjOQ', title: 'Motigbana (Jaiye vibe alt)', a: 'Olamide' },
  /* —— User list Hong Kong vibe —— */
  { g: 'pop', id: 'RtXRW5XJys8', title: 'Hong Kong', a: 'The Weeknd' },
];

const ALL = (() => {
  const seen = new Set(), out = [];
  for (const t of TRACKS) {
    if (!t.id || seen.has(t.id)) continue;
    seen.add(t.id);
    out.push(t);
  }
  return out;
})();

function trackLabel(t) {
  if (!t) return '';
  const who = t.artist || t.a || '';
  const title = t.title || '';
  if (who && title && !title.toLowerCase().includes(String(who).toLowerCase())) return who + ' — ' + title;
  return title || who || 'Untitled';
}

function trackHay(t) {
  return ((t.title || '') + ' ' + (t.artist || '') + ' ' + (t.a || '') + ' ' + (t.g || '')).toLowerCase();
}

/** Ranked matches for the search box (prefix hits first). */
function searchTracks(q, limit) {
  const raw = String(q || '').trim().toLowerCase();
  if (!raw) return [];
  const lim = Math.max(1, limit || 8);
  const words = raw.split(/\s+/).filter(Boolean);
  const scored = [];
  for (let i = 0; i < ALL.length; i++) {
    const t = ALL[i];
    const hay = trackHay(t);
    const label = trackLabel(t).toLowerCase();
    if (!words.every((w) => hay.includes(w))) continue;
    let score = 0;
    if (label.startsWith(raw)) score += 40;
    else if (hay.startsWith(raw)) score += 30;
    if (label.includes(raw)) score += 12;
    for (const w of words) {
      if (label.startsWith(w)) score += 8;
      else if ((' ' + label).includes(' ' + w)) score += 5;
      else score += 2;
    }
    scored.push({ i, score, label: trackLabel(t), g: t.g || '' });
  }
  scored.sort((a, b) => b.score - a.score || a.label.localeCompare(b.label));
  return scored.slice(0, lim);
}

const GENRES = [['all', 'All'], ['pop', 'Pop'], ['hiphop', 'Hip-hop / Rap'], ['rock', 'Rock'], ['electronic', 'Electronic'], ['latin', 'Latin'], ['afrobeat', 'Afrobeat'], ['gospel', 'Gospel'], ['country', 'Country'], ['soul', 'Soul / R&B'], ['classics', 'Classics'], ['movies', 'Movie soundtracks']];
const BED = { bpm: 110, root: 110, pattern: [1, 0, 0.5, 0, 1, 0, 0.35, 0.2], wave: 'triangle' };

const POS_KEY = 'hts-tour-yt-pos';

function loadPos() {
  try {
    const j = JSON.parse(localStorage.getItem(POS_KEY) || '{}');
    return {
      x: Number.isFinite(+j.x) ? +j.x : null,
      y: Number.isFinite(+j.y) ? +j.y : null,
      min: !!j.min,
      autoNext: j.autoNext !== false,
      /* driver-mode free place (drag/resize away from the dash media bay) */
      dashFree: !!j.dashFree,
      dashX: Number.isFinite(+j.dashX) ? +j.dashX : null,
      dashY: Number.isFinite(+j.dashY) ? +j.dashY : null,
      dashW: Number.isFinite(+j.dashW) ? +j.dashW : null,
      dashH: Number.isFinite(+j.dashH) ? +j.dashH : null,
    };
  } catch (e) {
    return { x: null, y: null, min: false, autoNext: true, dashFree: false, dashX: null, dashY: null, dashW: null, dashH: null };
  }
}

function savePos(p) {
  try { localStorage.setItem(POS_KEY, JSON.stringify(p)); } catch (e) { /* ignore */ }
}

let ytApiPromise = null;
function loadYTApi() {
  if (window.YT && window.YT.Player) return Promise.resolve(window.YT);
  if (ytApiPromise) return ytApiPromise;
  ytApiPromise = new Promise((resolve) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      try { if (typeof prev === 'function') prev(); } catch (e) { /* ignore */ }
      resolve(window.YT);
    };
    if (!document.querySelector('script[data-hts-yt]')) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.async = true;
      tag.dataset.htsYt = '1';
      document.head.appendChild(tag);
    }
    if (window.YT && window.YT.Player) resolve(window.YT);
  });
  return ytApiPromise;
}

export function createTourMusic() {
  let wrap = null, mount = null, label = null, miniLabel = null, autoBtn = null, foot = null;
  let on = false, track = null, idx = -1, minimized = false;
  let player = null, playerReady = false, pendingId = null, wantId = null, verifyTimer = 0;
  /* songs played, in order; hpos = the one playing. Prev/Next walk this list before Next shuffles a new song */
  const history = [];
  let hpos = -1;
  let pos = loadPos();
  let autoNext = pos.autoNext !== false;
  let advancing = false;
  let driverMode = false;
  let driverSlot = null;
  let ytOk = false;
  const listeners = new Set();
  let genre = 'all';
  /* empty = All; otherwise union of selected genre ids (multi-select) */
  let activeGenres = new Set();
  let order = ALL.map((_, i) => i);
  shuffle(order);
  let searchBound = false;

  let actx = null, master = null, bedNodes = [], bedTimer = 0, bedStep = 0, bedOn = false;

  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function emit() {
    const snap = {
      on, title: track ? track.title : '', idx, count: ALL.length, autoNext, driverMode,
      ytOk, source: ytOk ? 'youtube' : (on ? 'bed' : 'off'),
    };
    for (const fn of listeners) { try { fn(snap); } catch (e) { /* ignore */ } }
  }

  function ensureAudio() {
    if (!actx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      actx = new AC();
      master = actx.createGain();
      master.gain.value = 0.18;
      master.connect(actx.destination);
    }
    if (actx.state === 'suspended') {
      try { actx.resume(); } catch (e) { /* ignore */ }
    }
    return actx;
  }

  function stopBed() {
    if (bedTimer) { clearInterval(bedTimer); bedTimer = 0; }
    for (const n of bedNodes) {
      try { n.stop(); } catch (e) { /* ignore */ }
      try { n.disconnect(); } catch (e2) { /* ignore */ }
    }
    bedNodes = [];
    bedOn = false;
  }

  function tone(freq, dur, type, gain, t0) {
    if (!actx || !master) return;
    const o = actx.createOscillator();
    const g = actx.createGain();
    o.type = type || 'sine';
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(Math.max(0.001, gain), t0 + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(master);
    o.start(t0); o.stop(t0 + dur + 0.02);
    bedNodes.push(o);
    if (bedNodes.length > 32) {
      const old = bedNodes.splice(0, 12);
      for (const n of old) { try { n.stop(); } catch (e) { /* ignore */ } }
    }
  }

  function kick(t0, amt) {
    if (!actx || !master) return;
    const o = actx.createOscillator();
    const g = actx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(130, t0);
    o.frequency.exponentialRampToValueAtTime(40, t0 + 0.12);
    g.gain.setValueAtTime(amt, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.16);
    o.connect(g); g.connect(master);
    o.start(t0); o.stop(t0 + 0.18);
    bedNodes.push(o);
  }

  function startBed() {
    const ctx = ensureAudio();
    if (!ctx || !on || ytOk || bedOn) return;
    stopBed();
    bedOn = true;
    bedStep = 0;
    const stepMs = (60 / BED.bpm) * 1000 / 2;
    bedTimer = setInterval(() => {
      if (!on || !actx || ytOk) return;
      const t0 = actx.currentTime + 0.02;
      const v = BED.pattern[bedStep % BED.pattern.length];
      bedStep++;
      if (v > 0.85) kick(t0, 0.24);
      if (v > 0.05) {
        const f = BED.root * (1 + ((bedStep >> 1) % 3) * 0.15);
        tone(f, 0.14, BED.wave, 0.04 * v, t0);
        tone(f * 1.5, 0.1, 'sine', 0.018 * v, t0);
      }
    }, stepMs);
    emit();
  }

  function clampPos(x, y) {
    const w = wrap.offsetWidth || 240;
    const h = wrap.offsetHeight || 48;
    return {
      x: Math.max(8, Math.min(Math.max(8, innerWidth - w - 8), x)),
      y: Math.max(8, Math.min(Math.max(8, innerHeight - h - 8), y)),
    };
  }

  function applyPos() {
    if (!wrap || driverMode) return;
    injectSearchBar();
    if (pos.x == null || pos.y == null) {
      wrap.classList.remove('placed');
      wrap.style.left = ''; wrap.style.top = ''; wrap.style.right = ''; wrap.style.bottom = '';
      return;
    }
    const c = clampPos(pos.x, pos.y);
    pos.x = c.x; pos.y = c.y;
    wrap.classList.add('placed');
    wrap.style.left = c.x + 'px';
    wrap.style.top = c.y + 'px';
    wrap.style.right = 'auto';
    wrap.style.bottom = 'auto';
  }

  function syncAutoBtn() {
    if (!autoBtn) return;
    autoBtn.classList.toggle('on', autoNext);
    autoBtn.textContent = autoNext ? 'Auto ▶' : 'Auto';
    autoBtn.title = autoNext ? 'Autoplay next: on' : 'Autoplay next: off';
  }

  function genreFootLabel() {
    if (!activeGenres.size) return 'All';
    const names = GENRES.filter(([k]) => k !== 'all' && activeGenres.has(k)).map(([, n]) => n);
    if (!names.length) return 'All';
    if (names.length === 1) return names[0];
    if (names.length === 2) return names[0] + ' + ' + names[1];
    return names.length + ' genres';
  }

  function syncFoot() {
    if (!foot) return;
    const pool = order.length || ALL.length;
    const i = idx >= 0 ? (idx + 1) + ' / ' + pool : pool + ' songs';
    const src = !on ? 'off' : (ytOk ? 'YouTube' : 'audio bed');
    foot.textContent = genreFootLabel() + ' · ' + i + ' · ' + src;
  }

  function syncGenreButtons() {
    if (!wrap) return;
    wrap.querySelectorAll('[data-yt-genre]').forEach((b) => {
      const g = b.getAttribute('data-yt-genre');
      const onBtn = g === 'all' ? !activeGenres.size : activeGenres.has(g);
      b.style.background = onBtn ? '#1f6f43' : '#1b232c';
      b.classList.toggle('on', onBtn);
      b.setAttribute('aria-pressed', onBtn ? 'true' : 'false');
    });
  }

  function rebuildOrderFromGenres() {
    if (!activeGenres.size) {
      order = ALL.map((_, i) => i);
    } else {
      order = ALL.map((t, i) => (activeGenres.has(t.g) ? i : -1)).filter((i) => i >= 0);
    }
    if (!order.length) order = ALL.map((_, i) => i);
    shuffle(order);
    shuffleCursor = 0;
  }

  function setMinimized(m) {
    if (driverMode) return;
    minimized = !!m;
    pos.min = minimized;
    if (wrap) {
      wrap.classList.toggle('min', minimized);
      const btn = wrap.querySelector('[data-yt-min]');
      if (btn) {
        btn.textContent = minimized ? '▣' : '—';
        btn.title = minimized ? 'Expand player' : 'Minimize player';
      }
    }
    savePos(pos);
    requestAnimationFrame(applyPos);
  }

  function setAutoNext(v) {
    autoNext = !!v;
    pos.autoNext = autoNext;
    savePos(pos);
    syncAutoBtn();
    emit();
  }

  function searchCssText() {
    return '#tourYt .ytSearchWrap{position:relative;flex:0 0 auto;z-index:8;order:-1;margin:2px 0 4px}'
      + '#tourYt .ytSearch{width:100%;box-sizing:border-box;background:rgba(8,8,10,.92);border:1px solid rgba(232,168,56,.55);border-radius:8px;color:#f3ebe0;font:12px/1.3 Overpass,system-ui,sans-serif;padding:8px 10px;outline:none}'
      + '#tourYt .ytSearch::placeholder{color:#8a7e70}#tourYt .ytSearch:focus{border-color:rgba(232,168,56,.95);box-shadow:0 0 0 2px rgba(232,168,56,.22)}'
      + '#tourYt .ytSuggest{display:none;position:absolute;left:0;right:0;top:calc(100% + 3px);max-height:180px;overflow:auto;z-index:9;'
      + 'background:#16120e;border:1px solid rgba(232,168,56,.45);border-radius:8px;box-shadow:0 10px 24px rgba(0,0,0,.55)}'
      + '#tourYt .ytSuggest.on{display:block}'
      + '#tourYt .ytSuggest button{display:block;width:100%;text-align:left;border:0;border-bottom:1px solid rgba(255,236,210,.06);border-radius:0;background:transparent;color:#f3ebe0;padding:8px 10px;font-size:12px;font-weight:600;cursor:pointer}'
      + '#tourYt .ytSuggest button:last-child{border-bottom:0}'
      + '#tourYt .ytSuggest button:hover,#tourYt .ytSuggest button.active{background:rgba(232,168,56,.16)}'
      + '#tourYt .ytSuggest .sg{display:block;color:#e8c49a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'
      + '#tourYt .ytSuggest .sgG{display:block;color:#8a7e70;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.04em;margin-top:2px}'
      + '#tourYt.dashEmbed .ytSearch{font-size:11px;padding:6px 8px}#tourYt.dashEmbed .ytSuggest{max-height:120px}'
      + '#tourYt.min .ytSearchWrap{display:none}'
      + '#tourYt .gen button.on{background:#1f6f43!important;border-color:#2d8f58}';
  }

  function injectSearchBar() {
    if (!wrap) return;
    if (!document.getElementById('htsYtSearchCss')) {
      const css = document.createElement('style');
      css.id = 'htsYtSearchCss';
      css.textContent = searchCssText();
      document.head.appendChild(css);
    }
    if (!wrap.querySelector('[data-yt-search]')) {
      const bar = document.createElement('div');
      bar.className = 'ytSearchWrap';
      bar.innerHTML = '<input class="ytSearch" type="search" data-yt-search="1" placeholder="Search songs or artists…" autocomplete="off" spellcheck="false" aria-label="Search songs" aria-autocomplete="list"/>'
        + '<div class="ytSuggest" data-yt-suggest="1" role="listbox" hidden></div>';
      const hd = wrap.querySelector('.hd');
      const body = wrap.querySelector('.body');
      /* Prefer right under MUSIC header so it is never buried under the video */
      if (hd && hd.parentNode === wrap) wrap.insertBefore(bar, hd.nextSibling);
      else if (body) wrap.insertBefore(bar, body);
      else wrap.insertBefore(bar, wrap.firstChild);
    }
    if (!searchBound) bindSearch();
  }

  function ensureUi() {
    if (wrap) {
      injectSearchBar();
      return;
    }
    const css = document.createElement('style');
    css.id = 'htsYtSearchCss';
    css.textContent = '#tourYt{position:fixed;left:14px;bottom:14px;z-index:41;display:none;flex-direction:column;gap:6px;width:min(340px,70vw);background:rgba(14,12,10,.92);border:1px solid rgba(232,168,56,.3);border-radius:12px;padding:8px;box-shadow:0 10px 28px rgba(0,0,0,.45);font:11px/1.3 Overpass,system-ui,sans-serif;color:#f3ebe0;touch-action:none}'
      + '#tourYt.on{display:flex}#tourYt.placed{left:0;bottom:auto;right:auto}'
      /* Driver: fixed overlay docked in the passenger media bay (#dMediaSlot). Never reparent — moving the YT iframe restarts audio. */
      + '#tourYt.dashEmbed{position:fixed!important;z-index:42!important;display:flex!important;max-width:none!important;'
      + 'border:1px solid rgba(232,168,56,.55);border-radius:10px;box-shadow:inset 0 0 0 1px rgba(0,0,0,.35),0 6px 16px rgba(0,0,0,.35);margin:0;padding:6px 8px;'
      + 'pointer-events:auto!important;touch-action:none;box-sizing:border-box;background:linear-gradient(165deg,#2a2218,#14100c);overflow:hidden}'
      + '#tourYt.dashEmbed [data-yt-min]{display:none!important}'
      + '#tourYt.dashEmbed .hd{cursor:grab;border-bottom-color:rgba(232,168,56,.25)}'
      + '#tourYt.dashEmbed .hd:active{cursor:grabbing}'
      + '#tourYt.dashEmbed .ytResize{display:block}'
      + '#tourYt.dashEmbed [data-yt-dock]{display:inline-flex}'
      + '#tourYt .ytResize{display:none;position:absolute;right:2px;bottom:2px;width:16px;height:16px;cursor:nwse-resize;z-index:3;'
      + 'background:linear-gradient(135deg,transparent 55%,rgba(232,168,56,.55) 55%,rgba(232,168,56,.55) 70%,transparent 70%),'
      + 'linear-gradient(135deg,transparent 70%,rgba(232,168,56,.85) 70%);border-radius:0 0 8px 0}'
      + '#tourYt [data-yt-dock]{display:none}'
      + '#tourYt .hd{display:flex;align-items:center;gap:6px;cursor:grab;user-select:none;padding:2px 0 4px;border-bottom:1px solid rgba(255,236,210,.08);margin-bottom:2px}'
      + '#tourYt .hd:active{cursor:grabbing}#tourYt .hd .drag{color:#8a7e70;font-size:11px}'
      + '#tourYt .hd .acts{display:flex;gap:4px;margin-left:auto;flex-wrap:wrap;justify-content:flex-end}'
      + '#tourYt .host{display:none;width:100%;aspect-ratio:16/9;border-radius:8px;overflow:hidden;background:#111;flex:1;min-height:72px}'
      + '#tourYt.yt-ready .host,#tourYt.dashEmbed .host{display:block}'
      + '#tourYt.dashEmbed{flex-direction:column}#tourYt.dashEmbed .host{aspect-ratio:auto;flex:1 1 0;height:auto;min-height:48px;max-height:none;width:100%;align-self:stretch}'
      + '#tourYt .host iframe{width:100%;height:100%;border:0;display:block}'
      + '#tourYt.spot,#tourYt.radio{display:flex}#tourYt.radio .host{display:none!important}#tourYt.spot .host{display:none!important}#tourYt.dashEmbed .spotFrame{height:72px!important;flex:none}#tourYt.spot.dashEmbed .gen{display:none!important}#tourYt .spotFrame iframe{width:100%!important;height:100%!important;border:0}'
      + '#tourYt .body{display:flex;flex-direction:column;gap:6px;flex:1;min-height:0}'
      + '#tourYt.min{width:auto;max-width:min(340px,82vw);padding:6px 8px}'
      + '#tourYt.min .body,#tourYt.min .foot{display:none}'
      + '#tourYt.min .hd{border:0;margin:0;padding:0}'
      + '#tourYt:not(.min) .miniTtl{display:none}'
      + '#tourYt .hdLabel{color:#e8a838;font-weight:800;font-size:11px;letter-spacing:.08em}'
      + '#tourYt.min .hdLabel{display:none}'
      + '#tourYt .row{display:flex;gap:6px;align-items:center}'
      + '#tourYt .ttl{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#e8c49a;font-weight:700}'
      + '#tourYt .miniTtl{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#e8c49a;font-weight:700;max-width:140px}'
      + '#tourYt button{background:rgba(255,236,210,.08);border:1px solid rgba(232,168,56,.45);color:#f3ebe0;border-radius:7px;padding:5px 8px;font-size:11px;font-weight:700;cursor:pointer}'
      + '#tourYt button:hover{border-color:rgba(232,168,56,.7)}'
      + '#tourYt button.on{background:linear-gradient(135deg,#e8a838,#c96a28);border-color:transparent;color:#1a1008}'
      + '#tourYt .foot{color:#8a7e70;font-size:10px}'
      + '#tourYt .gen{flex-wrap:nowrap!important;overflow-x:auto;scrollbar-width:none;padding:2px 0!important}#tourYt .gen::-webkit-scrollbar{display:none}'
      + '#tourYt .gen button{flex:0 0 auto;white-space:nowrap}#tourYt .hd .acts button{min-width:30px;padding:5px 7px}'
      + '#tourYt.dashEmbed .foot{display:none}#tourYt.dashEmbed .gen{order:0}'
      + '#tourYt.dashEmbed{font-size:12px;gap:6px}#tourYt.dashEmbed button{font-size:12px;padding:5px 8px;border-radius:8px}#tourYt.dashEmbed .hd .acts button{min-width:34px;padding:5px 8px}#tourYt.dashEmbed .hdLabel{font-size:12px}'
      + searchCssText();
    document.head.appendChild(css);
    wrap = document.createElement('div');
    wrap.id = 'tourYt';
    wrap.innerHTML = '<div class="hd" data-yt-drag="1">'
      + '<span class="drag" title="Drag">⠿</span>'
      + '<span class="hdLabel">MUSIC</span>'
      + '<span class="miniTtl" id="tourYtMiniTitle">Music</span>'
      + '<span class="acts">'
      + '<button type="button" data-yt-dock="1" title="Dock back into the dash media bay">Dock</button>'
      + '<button type="button" data-yt-min="1" title="Minimize">—</button>'
      + '<button type="button" data-yt-prev="1" title="Previous">⏮</button>'
      + '<button type="button" data-yt-next="1" title="Next">⏭</button>'
      + '<button type="button" data-yt-auto="1" title="Autoplay next">Auto ▶</button>'
      + '<button type="button" data-yt-radio="1" title="Houston radio stations">Radio</button>'
      + '<button type="button" data-yt-spot="1" title="Spotify player (free embed — full songs if you are logged in to Spotify in this browser, 30-second previews otherwise)">Spotify</button>'
      + '<button type="button" data-yt-off="1" title="Stop music">■</button>'
      + '</span></div>'
      + '<div class="ytSearchWrap">'
      + '<input class="ytSearch" type="search" data-yt-search="1" placeholder="Search songs or artists…" autocomplete="off" spellcheck="false" aria-label="Search songs" aria-autocomplete="list"/>'
      + '<div class="ytSuggest" data-yt-suggest="1" role="listbox" hidden></div>'
      + '</div>'
      + '<div class="body">'
      + '<div class="host"><div id="tourYtMount"></div></div>'
      + '<div class="row"><span class="ttl" id="tourYtTitle">Music off</span></div>'
      + '</div>'
      + '<div class="row gen" style="display:flex;flex-wrap:wrap;gap:4px;padding:4px 8px" title="Tap genres to filter — pick more than one">' + GENRES.map(([k, n]) => '<button type="button" data-yt-genre="' + k + '" aria-pressed="' + (k === 'all' ? 'true' : 'false') + '" style="font-size:11px;padding:3px 7px;border-radius:10px;border:1px solid #34404c;background:' + (k === 'all' ? '#1f6f43' : '#1b232c') + ';color:#dbe6f0">' + n + '</button>').join('') + '</div>'
      + '<div class="foot" id="tourYtFoot">All · ' + ALL.length + ' songs</div>'
      + '<div class="ytResize" data-yt-resize="1" title="Drag to resize"></div>';
    document.body.appendChild(wrap);
    mount = wrap.querySelector('#tourYtMount');
    label = wrap.querySelector('#tourYtTitle');
    miniLabel = wrap.querySelector('#tourYtMiniTitle');
    autoBtn = wrap.querySelector('[data-yt-auto]');
    foot = wrap.querySelector('#tourYtFoot');
    /* live Houston radio — free public streams of real local stations (no keys, no cost) */
    {
      const HOU = [
        { n: '94.5 The Buzz · Rock', u: 'https://stream.revma.ihrhls.com/zc2281' },
        { n: 'Sunny 99.1 · Soft hits', u: 'https://stream.revma.ihrhls.com/zc2273' },
        { n: 'KSBJ 89.3 · Christian', u: 'https://ais-sa8.cdnstream1.com/3327_64.aac' },
        { n: 'KJIC 90.5 · Christian country', u: 'https://ice42.securenetsystems.net/KJIC' },
        { n: 'SUC Radio · Houston screw & rap', u: 'https://radio.screwedup.click/listen/suc_radio/radio.mp3' },
        { n: 'Houston Public Media Mixtape', u: 'https://stream.houstonpublicmedia.org/mixtape-aac' },
        { n: 'Houston Public Media Classical', u: 'https://stream.houstonpublicmedia.org/classical-aac' },
        { n: 'News 88.7 KUHF · NPR', u: 'https://stream.houstonpublicmedia.org/news-aac' },
        { n: 'News Talk 740 KTRH', u: 'https://stream.revma.ihrhls.com/zc2285' },
        { n: 'KPRC AM 950 · Talk', u: 'https://stream.revma.ihrhls.com/zc2277' },
        { n: 'Sangeet Radio 95.1 · Hindi', u: 'https://ice8.securenetsystems.net/SGTRADIO' }
      ];
      const rBtn = wrap.querySelector('[data-yt-radio]'), offBtn = wrap.querySelector('[data-yt-off]');
      rBtn.title = 'Houston radio on/off — ⏮ ⏭ change station';
      let au = null, idx = 0, on = false, fails = 0, tok = 0;
      /* keep: Radio toggled off leaves the player open; ■ or starting YouTube closes radio mode */
      const stopRadio = (keep) => { on = false; tok++; if (au) { au.pause(); au.removeAttribute('src'); au.load(); } rBtn.classList.remove('on'); if (keep !== true) wrap.classList.remove('radio'); };
      const skip = () => { if (!on) return; if (++fails >= HOU.length) { if (label) label.textContent = 'Radio unavailable right now'; stopRadio(); return; } idx = (idx + 1) % HOU.length; playSt(); };
      const playSt = () => {
        const st = HOU[idx];
        au = au || new Audio(); au.preload = 'none'; au.src = st.u;
        const my = ++tok;
        au.onplaying = () => { if (my === tok) fails = 0; };
        au.onerror = () => { if (my === tok) skip(); };
        /* changing station aborts the previous play(); only a real failure of the current station skips ahead */
        au.play().catch((err) => { if (my === tok && !(err && err.name === 'AbortError')) skip(); });
        if (label) label.textContent = '📻 ' + st.n;
        if (miniLabel) miniLabel.textContent = st.n;
        if (foot) foot.textContent = 'Houston radio · station ' + (idx + 1) + ' of ' + HOU.length + ' · ⏮ ⏭ change station';
      };
      const step = (d) => { fails = 0; idx = (idx + d + HOU.length) % HOU.length; playSt(); };
      rBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        /* Radio is an on/off toggle; ⏮ ⏭ change station while it plays. Only one source at a time: turning radio on stops YouTube */
        if (on) { stopRadio(true); if (label) label.textContent = 'Radio off'; if (foot) foot.textContent = 'Radio off · tap Radio to turn it back on'; return; }
        if (wrap._spotClose) wrap._spotClose();
        setOn(false);
        on = true; fails = 0; rBtn.classList.add('on'); wrap.classList.add('radio'); playSt();
      });
      offBtn.addEventListener('click', () => { if (on) stopRadio(); else wrap.classList.remove('radio'); });
      wrap.querySelector('[data-yt-next]').addEventListener('click', (e) => { if (on) { e.stopImmediatePropagation(); step(1); } }, true);
      wrap.querySelector('[data-yt-prev]').addEventListener('click', (e) => { if (on) { e.stopImmediatePropagation(); step(-1); } }, true);
      window.HTS_RADIO = { stations: HOU, get on() { return on; }, get station() { return on ? HOU[idx].n : null; }, stop: stopRadio };
    }
    /* Spotify: the free official embed (no key, no account on our side). Pauses YouTube/radio while open. */
    {
      const PL = { all: '37i9dQZF1DXcBWIGoYBM5M', pop: '37i9dQZF1DXcBWIGoYBM5M', hiphop: '37i9dQZF1DX0XUsuxWHRQd', rock: '37i9dQZF1DWXRqgorJj26U', electronic: '37i9dQZF1DX4dyzvuaRJ0n', latin: '37i9dQZF1DX10zKzsJ2jva', afrobeat: '37i9dQZF1DWYkaDif7Ztbp', gospel: '37i9dQZF1DXcb6CQIjdqKy', country: '37i9dQZF1DX1lVhptIYRda', classics: '37i9dQZF1DX4UtSsGT1Sbe' };
      const sBtn = wrap.querySelector('[data-yt-spot]'), offBtn2 = wrap.querySelector('[data-yt-off]');
      let box = null;
      let ctrl = null, spotApi = null, spotWait = null;
      const close = () => { try { if (ctrl && ctrl.destroy) ctrl.destroy(); } catch (e) { /* ignore */ } ctrl = null; if (box) { box.remove(); box = null; } sBtn.classList.remove('on'); wrap.classList.remove('spot'); };
      /* official free Spotify iFrame API: lets our button start playback (no key, no account on our side) — plain embed if it can't load */
      const loadSpotApi = () => spotWait || (spotWait = new Promise((res) => {
        if (spotApi) { res(spotApi); return; }
        const prev = window.onSpotifyIframeApiReady;
        window.onSpotifyIframeApiReady = (api) => { spotApi = api; try { if (prev) prev(api); } catch (e) { /* ignore */ } res(api); };
        const sc = document.createElement('script'); sc.src = 'https://open.spotify.com/embed/iframe-api/v1'; sc.async = true;
        sc.onerror = () => { spotWait = null; res(null); };
        document.head.appendChild(sc);
        setTimeout(() => res(spotApi), 5000);
      }));
      wrap._spotClose = close;
      sBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        /* already open: a second tap keeps it (only ■ closes) — it used to close Spotify and, with YouTube off, the whole player */
        if (box) return;
        offBtn2.click();
        const pid = PL[genre] || PL.all, h = wrap.classList.contains('dashEmbed') ? 80 : 152;
        box = document.createElement('div'); box.className = 'spotFrame';
        box.style.cssText = 'width:100%;height:' + h + 'px;border-radius:10px;overflow:hidden;flex:none;background:#121212';
        const slot = document.createElement('div'); box.appendChild(slot);
        const mine = box;
        const plain = () => {
          if (box !== mine || mine.querySelector('iframe')) return;
          const f = document.createElement('iframe');
          f.src = 'https://open.spotify.com/embed/playlist/' + pid + '?utm_source=generator&theme=0';
          f.allow = 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
          f.style.cssText = 'width:100%;height:100%;border:0;display:block';
          mine.replaceChildren(f);
        };
        loadSpotApi().then((api) => {
          if (box !== mine) return;
          if (!api) { plain(); return; }
          try {
            api.createController(slot, { uri: 'spotify:playlist:' + pid, width: '100%', height: h }, (c) => {
              if (box !== mine) { try { c.destroy(); } catch (e3) { /* ignore */ } return; }
              ctrl = c;
              c.addListener('ready', () => { try { c.play(); } catch (e3) { /* ignore */ } });
              c.addListener('playback_update', (ev) => { const d = ev && ev.data; if (d && !d.isPaused && label) label.textContent = 'Spotify · playing'; });
            });
          } catch (e3) { plain(); }
        });
        setTimeout(() => { if (box === mine && !mine.querySelector('iframe')) plain(); }, 7000);
        /* keep the panel visible while YouTube is off (setOn(false) hides #tourYt otherwise — the Spotify player vanished) */
        try { if (window.HTS_RADIO && window.HTS_RADIO.on) window.HTS_RADIO.stop(); } catch (e2) { /* ignore */ }
        wrap.insertBefore(box, wrap.querySelector('.body')); sBtn.classList.add('on'); wrap.classList.add('spot');
        if (label) label.textContent = 'Spotify · press play in the player';
      });
      offBtn2.addEventListener('click', close);
    }
    wrap.querySelectorAll('[data-yt-genre]').forEach((b) => b.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleGenre(b.getAttribute('data-yt-genre'));
    }));
    wrap.querySelector('[data-yt-prev]').addEventListener('click', (e) => { e.stopPropagation(); playPrev(); });
    wrap.querySelector('[data-yt-next]').addEventListener('click', (e) => { e.stopPropagation(); playNext(); });
    wrap.querySelector('[data-yt-off]').addEventListener('click', (e) => { e.stopPropagation(); setOn(false); });
    wrap.querySelector('[data-yt-min]').addEventListener('click', (e) => {
      e.stopPropagation();
      setMinimized(!minimized);
    });
    autoBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      setAutoNext(!autoNext);
    });
    bindSearch();
    bindDrag();
    syncGenreButtons();
    syncAutoBtn();
    syncFoot();
    if (pos.min) setMinimized(true);
    applyPos();
  }

  function bindSearch() {
    const input = wrap.querySelector('[data-yt-search]');
    const box = wrap.querySelector('[data-yt-suggest]');
    if (!input || !box || searchBound) return;
    searchBound = true;
    let hits = [];
    let active = -1;
    let timer = 0;

    const hide = () => {
      hits = [];
      active = -1;
      box.classList.remove('on');
      box.hidden = true;
      box.innerHTML = '';
    };

    const paint = () => {
      box.querySelectorAll('button').forEach((b, i) => b.classList.toggle('active', i === active));
    };

    const show = (list) => {
      hits = list;
      active = list.length ? 0 : -1;
      if (!list.length) {
        hide();
        return;
      }
      box.innerHTML = list.map((h, i) => (
        '<button type="button" role="option" data-yt-hit="' + h.i + '"' + (i === 0 ? ' class="active"' : '') + '>'
        + '<span class="sg">' + h.label.replace(/</g, '&lt;') + '</span>'
        + (h.g ? '<span class="sgG">' + h.g + '</span>' : '')
        + '</button>'
      )).join('');
      box.hidden = false;
      box.classList.add('on');
    };

    const pick = (listIdx) => {
      if (listIdx == null || listIdx < 0) return;
      const t = ALL[listIdx];
      if (!t) return;
      try { if (window.HTS_RADIO && window.HTS_RADIO.on) window.HTS_RADIO.stop(); } catch (e) { /* ignore */ }
      if (wrap._spotClose) wrap._spotClose();
      input.value = trackLabel(t);
      hide();
      playAt(listIdx);
      try { input.blur(); } catch (e) { /* ignore */ }
    };

    const refresh = () => {
      const q = input.value;
      if (!String(q || '').trim()) { hide(); return; }
      show(searchTracks(q, 8));
    };

    input.addEventListener('pointerdown', (e) => e.stopPropagation());
    input.addEventListener('click', (e) => e.stopPropagation());
    input.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(refresh, 60);
    });
    input.addEventListener('focus', () => {
      if (String(input.value || '').trim()) refresh();
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        hide();
        input.blur();
        e.preventDefault();
        return;
      }
      if (!hits.length) {
        if (e.key === 'Enter') {
          const list = searchTracks(input.value, 1);
          if (list[0]) { e.preventDefault(); pick(list[0].i); }
        }
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        active = (active + 1) % hits.length;
        paint();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        active = (active - 1 + hits.length) % hits.length;
        paint();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const hit = hits[active >= 0 ? active : 0];
        if (hit) pick(hit.i);
      }
    });
    box.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const btn = e.target.closest('[data-yt-hit]');
      if (!btn) return;
      pick(+btn.getAttribute('data-yt-hit'));
    });
    document.addEventListener('pointerdown', (e) => {
      if (!wrap || !wrap.contains(e.target)) hide();
      else if (!e.target.closest('.ytSearchWrap')) hide();
    });
  }

  function bindDrag() {
    let drag = null;
    let resize = null;
    const dockBtn = wrap.querySelector('[data-yt-dock]');
    if (dockBtn) {
      dockBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        pos.dashFree = false;
        pos.dashX = null; pos.dashY = null; pos.dashW = null; pos.dashH = null;
        savePos(pos);
        if (driverMode) placeDashOverlay();
      });
    }
    wrap.addEventListener('pointerdown', (e) => {
      if (e.target.closest('button,a,iframe,input,select')) return;
      const r = wrap.getBoundingClientRect();
      const rz = e.target.closest('[data-yt-resize]');
      if (rz && driverMode) {
        resize = { x0: e.clientX, y0: e.clientY, w0: r.width, h0: r.height, id: e.pointerId };
        try { wrap.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
        e.preventDefault();
        return;
      }
      const handle = e.target.closest('[data-yt-drag]');
      if (!handle) return;
      if (!driverMode && !wrap.classList.contains('placed')) {
        pos.x = r.left; pos.y = r.top;
        applyPos();
      }
      drag = { dx: e.clientX - r.left, dy: e.clientY - r.top, id: e.pointerId, driver: !!driverMode };
      try { wrap.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      e.preventDefault();
    });
    wrap.addEventListener('pointermove', (e) => {
      if (resize && e.pointerId === resize.id) {
        const vw = window.innerWidth, vh = window.innerHeight;
        const w = Math.max(180, Math.min(vw - 16, resize.w0 + (e.clientX - resize.x0)));
        const h = Math.max(120, Math.min(vh - 16, resize.h0 + (e.clientY - resize.y0)));
        const left = Math.max(4, Math.min(vw - w - 4, wrap.getBoundingClientRect().left));
        const top = Math.max(4, Math.min(vh - h - 4, wrap.getBoundingClientRect().top));
        wrap.style.width = Math.round(w) + 'px';
        wrap.style.height = Math.round(h) + 'px';
        wrap.style.left = Math.round(left) + 'px';
        wrap.style.top = Math.round(top) + 'px';
        pos.dashFree = true;
        pos.dashW = w; pos.dashH = h; pos.dashX = left; pos.dashY = top;
        return;
      }
      if (!drag || e.pointerId !== drag.id) return;
      if (drag.driver) {
        const vw = window.innerWidth, vh = window.innerHeight;
        const w = wrap.offsetWidth || 220, h = wrap.offsetHeight || 160;
        const x = Math.max(4, Math.min(vw - w - 4, e.clientX - drag.dx));
        const y = Math.max(4, Math.min(vh - h - 4, e.clientY - drag.dy));
        wrap.style.left = Math.round(x) + 'px';
        wrap.style.top = Math.round(y) + 'px';
        pos.dashFree = true;
        pos.dashX = x; pos.dashY = y;
        pos.dashW = w; pos.dashH = h;
        return;
      }
      const c = clampPos(e.clientX - drag.dx, e.clientY - drag.dy);
      pos.x = c.x; pos.y = c.y;
      wrap.style.left = c.x + 'px';
      wrap.style.top = c.y + 'px';
    });
    const end = (e) => {
      if (resize && (!e || e.pointerId === resize.id)) {
        resize = null;
        savePos(pos);
        return;
      }
      if (!drag || (e && e.pointerId !== drag.id)) return;
      drag = null;
      savePos(pos);
    };
    wrap.addEventListener('pointerup', end);
    wrap.addEventListener('pointercancel', end);
  }

  function syncTitles() {
    const t = track ? track.title : 'Music';
    if (label) label.textContent = track ? track.title : 'Music off';
    if (miniLabel) miniLabel.textContent = t;
    syncFoot();
    emit();
  }

  function onPlayerState(e) {
    if (e && e.data === 1) {
      ytOk = true;
      stopBed();
      syncFoot();
      emit();
    }
    if (e && e.data === 0 && autoNext && on && !advancing) {
      advancing = true;
      playNext();
      setTimeout(() => { advancing = false; }, 350);
    }
  }

  function destroyPlayer() {
    if (verifyTimer) { clearTimeout(verifyTimer); verifyTimer = 0; }
    ytOk = false;
    try {
      if (player) {
        try { if (player.stopVideo) player.stopVideo(); } catch (e0) { /* ignore */ }
        try { if (player.destroy) player.destroy(); } catch (e1) { /* ignore */ }
      }
    } catch (e) { /* ignore */ }
    player = null;
    playerReady = false;
    if (wrap) {
      wrap.classList.remove('yt-ready');
      const host = wrap.querySelector('.host');
      if (host) {
        host.innerHTML = '<div id="tourYtMount"></div>';
        mount = host.querySelector('#tourYtMount');
      }
    }
  }

  async function ensurePlayer() {
    ensureUi();
    const YT = await loadYTApi();
    if (player) return player;
    if (!mount || !mount.isConnected) {
      const host = wrap.querySelector('.host');
      if (host) {
        host.innerHTML = '<div id="tourYtMount"></div>';
        mount = host.querySelector('#tourYtMount');
      }
    }
    const startId = pendingId || wantId || undefined;
    return new Promise((resolve) => {
      player = new YT.Player(mount, {
        width: '320',
        height: '180',
        videoId: startId || undefined,
        host: 'https://www.youtube-nocookie.com',
        playerVars: {
          autoplay: startId ? 1 : 0,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          controls: 1,
          origin: location.origin || undefined,
        },
        events: {
          onReady: () => {
            playerReady = true;
            if (wrap) wrap.classList.add('yt-ready');
            const id = pendingId || wantId;
            if (id) {
              try {
                player.loadVideoById({ videoId: id, startSeconds: 0 });
                if (player.playVideo) player.playVideo();
              } catch (e) { /* ignore */ }
              pendingId = null;
              verifyLoaded(id);
            }
            resolve(player);
          },
          onStateChange: onPlayerState,
          onError: () => {
            ytOk = false;
            try { if (player && player.stopVideo) player.stopVideo(); } catch (e) { /* ignore */ }
            startBed();
            syncFoot();
            emit();
            if (on) setTimeout(() => { if (!ytOk && on) playNext(); }, 700);
          },
        },
      });
    });
  }

  function verifyLoaded(id) {
    if (verifyTimer) clearTimeout(verifyTimer);
    verifyTimer = setTimeout(() => {
      verifyTimer = 0;
      if (!on || wantId !== id) return;
      try {
        const data = player && playerReady && player.getVideoData && player.getVideoData();
        const cur = data && data.video_id;
        if (cur === id) {
          ytOk = true;
          stopBed();
          syncFoot();
          emit();
          return;
        }
        pendingId = id;
        destroyPlayer();
        startBed();
        ensurePlayer();
      } catch (e) {
        pendingId = id;
        destroyPlayer();
        startBed();
        ensurePlayer();
      }
    }, 1000);
  }

  function loadVideo(id) {
    if (wrap && wrap._spotClose) wrap._spotClose();
    try { if (window.HTS_RADIO && window.HTS_RADIO.on) window.HTS_RADIO.stop(); } catch (e) { /* ignore */ }
    wantId = id;
    pendingId = id;
    ytOk = false;
    ensureUi();
    startBed();
    if (player && playerReady && typeof player.loadVideoById === 'function') {
      try {
        try { if (player.stopVideo) player.stopVideo(); } catch (e0) { /* ignore */ }
        player.loadVideoById({ videoId: id, startSeconds: 0 });
        try { if (player.playVideo) player.playVideo(); } catch (e1) { /* ignore */ }
        pendingId = null;
        verifyLoaded(id);
        return;
      } catch (e) { /* fall through */ }
    }
    destroyPlayer();
    ensurePlayer();
  }

  function playAt(listIdx, opts = {}) {
    ensureUi();
    if (!ALL.length) return;
    const next = ((listIdx % ALL.length) + ALL.length) % ALL.length;
    if (!opts.fromHistory) {
      if (history[hpos] !== next) { history.length = hpos + 1; history.push(next); }
      if (history.length > 80) history.splice(0, history.length - 80);
      hpos = history.length - 1;
    }
    idx = next;
    track = ALL[idx];
    syncTitles();
    on = true;
    syncMount();
    applyPos();
    loadVideo(track.id);
  }

  let shuffleCursor = 0;
  function playNext() {
    if (!ALL.length) return;
    if (hpos >= 0 && hpos < history.length - 1) { hpos++; playAt(history[hpos], { fromHistory: true }); return; }
    if (shuffleCursor >= order.length) {
      shuffle(order);
      shuffleCursor = 0;
      /* avoid immediate repeat of last track */
      if (order.length > 1 && order[0] === idx) {
        const t = order[0]; order[0] = order[1]; order[1] = t;
      }
    }
    const n = order[shuffleCursor++];
    playAt(n);
  }

  function playPrev() {
    if (hpos > 0) { hpos--; playAt(history[hpos], { fromHistory: true }); return; }
    if (idx >= 0) loadVideo(ALL[idx].id);
  }

  function playRandom() { playNext(); }

  /** Dock into the passenger media bay (#dMediaSlot) — never grow over NAV / gauges. */
  function placeDashOverlay() {
    const dashEl = document.getElementById('tourDash');
    if (!wrap || !dashEl || !dashEl.classList.contains('on')) return;
    const r = dashEl.getBoundingClientRect();
    if (r.width < 8 || r.height < 8) return;
    const vw = window.innerWidth, vh = window.innerHeight;
    const put = (l, t, w2, h2) => {
      wrap.style.left = Math.round(l) + 'px'; wrap.style.top = Math.round(t) + 'px';
      wrap.style.width = Math.round(w2) + 'px'; wrap.style.height = Math.round(h2) + 'px';
      wrap.style.right = 'auto'; wrap.style.bottom = 'auto';
    };
    /* User dragged/resized away from the bay — keep their place until Dock */
    if (pos.dashFree && Number.isFinite(pos.dashX) && Number.isFinite(pos.dashY)) {
      const w2 = Math.max(180, Math.min(vw - 12, pos.dashW || 240));
      const h2 = Math.max(120, Math.min(vh - 12, pos.dashH || 180));
      put(
        Math.max(4, Math.min(vw - w2 - 4, pos.dashX)),
        Math.max(4, Math.min(vh - h2 - 4, pos.dashY)),
        w2, h2,
      );
      return;
    }
    const gen = wrap.querySelector('.row.gen'); if (gen) gen.style.display = 'flex';
    const slot = dashEl.querySelector('#dMediaSlot');
    if (slot) {
      const b = slot.getBoundingClientRect();
      const pad = 3;
      const l = Math.max(4, b.left + pad);
      const t = Math.max(4, b.top + pad);
      const rr = Math.min(vw - 4, b.right - pad);
      const bb = Math.min(vh - 4, b.bottom - pad);
      /* bay visible: stay strictly inside it so NAV / gauges stay clear */
      if (rr - l >= 110 && bb - t >= 90) {
        put(l, t, rr - l, bb - t);
        return;
      }
      /* bay cropped (phones): compact strip on the lower passenger side, still clear of left gauges */
      if (gen) gen.style.display = 'none';
      const w2 = Math.min(280, Math.max(160, vw * 0.34));
      const h2 = Math.min(150, Math.max(110, r.height * 0.38));
      put(
        Math.max(4, Math.min(vw - w2 - 8, b.right - w2)),
        Math.max(r.top + 4, Math.min(vh - h2 - 8, r.bottom - h2 - 8)),
        w2, h2,
      );
      return;
    }
    /* no bay (older dash): leave a gap left of the gauge cluster — never cover it */
    let w = Math.min(r.width * 0.2, 220, vw * 0.2);
    let h = Math.min(r.height * 0.48, 170, vh * 0.24);
    let left = r.left + r.width * 0.016;
    let top = r.bottom - r.height * 0.14 - h;
    let gl = 1e9, gt = 1e9, gr = -1e9;
    dashEl.querySelectorAll('.dLeft').forEach((el) => {
      const b = el.getBoundingClientRect();
      if (b.width > 0) { gl = Math.min(gl, b.left); gt = Math.min(gt, b.top); gr = Math.max(gr, b.right); }
    });
    if (gr > gl) {
      const room = gl - r.left - 14;
      if (room >= 150) {
        w = Math.min(w, room - 4); left = r.left + 8;
      } else {
        w = Math.max(150, Math.min(w, gr - Math.max(4, r.left + 8)));
        h = Math.min(h, 130, Math.max(100, gt - 10));
        left = r.left + 8; top = gt - h - 10;
      }
    }
    put(Math.max(4, left), Math.max(4, top), Math.max(150, w), Math.max(110, h));
  }

  window.addEventListener('resize', () => { if (driverMode) placeDashOverlay(); });

  function syncMount() {
    ensureUi();
    if (!wrap) return;
    /* Keep #tourYt on document.body forever. appendChild into/out of #tourDash
       remounts the YouTube iframe and restarts the track on every view change. */
    if (wrap.parentNode && wrap.parentNode !== document.body) {
      document.body.appendChild(wrap);
    }
    if (driverMode) {
      const dashEl = document.getElementById('tourDash');
      if (dashEl && dashEl.classList.contains('on')) {
        wrap.classList.add('on', 'dashEmbed');
        wrap.classList.remove('placed', 'min');
        placeDashOverlay();
        return;
      }
    }
    wrap.classList.remove('dashEmbed');
    wrap.style.width = '';
    wrap.style.height = '';
    wrap.style.top = '';
    wrap.style.left = '';
    wrap.style.bottom = '';
    if (on) {
      wrap.classList.add('on');
      if (pos.min) wrap.classList.add('min');
      applyPos();
    } else {
      wrap.classList.remove('on');
    }
  }

  function setOn(v) {
    ensureUi();
    const want = !!v;
    if (want === on) {
      /* Already in this state — do not reload / restart the current track */
      syncMount();
      emit();
      return;
    }
    on = want;
    if (on) {
      loadYTApi();
      ensureAudio();
      if (!track) playNext();
      else if (track.id) loadVideo(track.id);
      else startBed();
    } else {
      track = null;
      pendingId = null;
      ytOk = false;
      stopBed();
      try { if (window.HTS_RADIO && window.HTS_RADIO.on) window.HTS_RADIO.stop(); } catch (e) { /* ignore */ }
      syncTitles();
      try {
        if (player && playerReady && player.stopVideo) player.stopVideo();
      } catch (e) { /* ignore */ }
    }
    syncMount();
    emit();
  }

  function stop() { setOn(false); }

  function setDriverMode(v, slot) {
    ensureUi();
    const next = !!v;
    const nextSlot = next && slot ? slot : null;
    if (driverMode === next && driverSlot === nextSlot) {
      if (next) syncMount();
      return;
    }
    driverMode = next;
    driverSlot = nextSlot;
    syncMount();
    emit();
  }

  /** Put player inside the driver dash (left of RPM). */
  function pinToDriverSlot(slot) {
    ensureUi();
    if (slot) driverSlot = slot;
    if (!driverMode) {
      driverMode = true;
      syncMount();
      emit();
    } else {
      syncMount();
    }
  }

  function clearDriverPin() {
    if (!driverMode) return;
    driverMode = false;
    driverSlot = null;
    syncMount();
    emit();
  }

  /** Toggle a genre chip (multi-select). "All" clears the filter. */
  function toggleGenre(g) {
    ensureUi();
    if (g === 'all' || !g) {
      activeGenres.clear();
      genre = 'all';
    } else if (GENRES.some(([k]) => k === g)) {
      if (activeGenres.has(g)) activeGenres.delete(g);
      else activeGenres.add(g);
      genre = activeGenres.size === 1 ? [...activeGenres][0] : (activeGenres.size ? 'mixed' : 'all');
    }
    history.length = hpos + 1;
    rebuildOrderFromGenres();
    syncGenreButtons();
    syncFoot();
    if (!on) setOn(true);
    else playNext();
  }

  /* API: select one genre (or all) — used by older callers */
  function setGenre(g) {
    ensureUi();
    activeGenres.clear();
    if (g && g !== 'all' && GENRES.some(([k]) => k === g)) activeGenres.add(g);
    genre = activeGenres.size ? [...activeGenres][0] : 'all';
    history.length = hpos + 1;
    rebuildOrderFromGenres();
    syncGenreButtons();
    syncFoot();
    if (!on) setOn(true);
    else playNext();
  }

  function subscribe(fn) {
    listeners.add(fn);
    try {
      fn({
        on, title: track ? track.title : '', idx, count: ALL.length, autoNext, driverMode,
        ytOk, source: ytOk ? 'youtube' : (on ? 'bed' : 'off'),
      });
    } catch (e) { /* ignore */ }
    return () => listeners.delete(fn);
  }

  return {
    setOn, playRandom, playNext, playPrev, stop, setGenre, setDriverMode, setAutoNext,
    pinToDriverSlot, clearDriverPin, subscribe,
    get on() { return on; },
    get title() { return track ? track.title : ''; },
    get genre() { return genre; },
    get genres() { return GENRES.map(([k, n]) => ({ id: k, name: n })); },
    get trackCount() { return ALL.length; },
    get driverMode() { return driverMode; },
  };
}
