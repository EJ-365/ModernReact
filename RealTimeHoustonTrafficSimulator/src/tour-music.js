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
  { g: 'hiphop', id: '7PBYGu4Az8s', title: 'Body', artist: 'Megan Thee Stallion' },
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
    };
  } catch (e) {
    return { x: null, y: null, min: false, autoNext: true };
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
  let history = [];
  let pos = loadPos();
  let autoNext = pos.autoNext !== false;
  let advancing = false;
  let driverMode = false;
  let driverSlot = null;
  let ytOk = false;
  const listeners = new Set();
  let genre = 'all';
  let order = ALL.map((_, i) => i);
  shuffle(order);

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

  function syncFoot() {
    if (!foot) return;
    const i = idx >= 0 ? (idx + 1) + ' / ' + ALL.length : ALL.length + ' songs';
    const src = !on ? 'off' : (ytOk ? 'YouTube' : 'audio bed');
    foot.textContent = 'Shuffle · ' + i + ' · ' + src;
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

  function ensureUi() {
    if (wrap) return;
    const css = document.createElement('style');
    css.textContent = '#tourYt{position:fixed;left:14px;bottom:14px;z-index:41;display:none;flex-direction:column;gap:6px;width:min(300px,56vw);background:rgba(14,12,10,.92);border:1px solid rgba(232,168,56,.3);border-radius:12px;padding:8px;box-shadow:0 10px 28px rgba(0,0,0,.45);font:11px/1.3 Overpass,system-ui,sans-serif;color:#f3ebe0;touch-action:none}'
      + '#tourYt.on{display:flex}#tourYt.placed{left:0;bottom:auto;right:auto}'
      /* Driver look: stay on body (fixed overlay). Never reparent — moving the YT iframe restarts audio. */
      + '#tourYt.dashEmbed{position:fixed!important;z-index:42!important;display:flex!important;max-width:none!important;'
      + 'border:2px solid #e8a838;border-radius:14px;box-shadow:0 8px 22px rgba(0,0,0,.45);margin:0;padding:8px 10px;'
      + 'pointer-events:auto!important;touch-action:auto;box-sizing:border-box;background:linear-gradient(165deg,#2a2218,#14100c)}'
      + '#tourYt.dashEmbed .hd .drag,#tourYt.dashEmbed [data-yt-min]{display:none!important}'
      + '#tourYt.dashEmbed .hd{cursor:default;border-bottom-color:rgba(232,168,56,.25)}'
      + '#tourYt .hd{display:flex;align-items:center;gap:6px;cursor:grab;user-select:none;padding:2px 0 4px;border-bottom:1px solid rgba(255,236,210,.08);margin-bottom:2px}'
      + '#tourYt .hd:active{cursor:grabbing}#tourYt .hd .drag{color:#8a7e70;font-size:11px}'
      + '#tourYt .hd .acts{display:flex;gap:4px;margin-left:auto;flex-wrap:wrap;justify-content:flex-end}'
      + '#tourYt .host{display:none;width:100%;aspect-ratio:16/9;border-radius:8px;overflow:hidden;background:#111;flex:1;min-height:72px}'
      + '#tourYt.yt-ready .host,#tourYt.dashEmbed .host{display:block}'
      + '#tourYt.dashEmbed{flex-direction:column;overflow:hidden}#tourYt.dashEmbed .host{aspect-ratio:auto;flex:1 1 0;height:auto;min-height:60px;max-height:none;width:100%;align-self:stretch}'
      + '#tourYt .host iframe{width:100%;height:100%;border:0;display:block}'
      + '#tourYt.spot,#tourYt.radio{display:flex}#tourYt.radio .host{display:none!important}#tourYt.spot .host{display:none!important}#tourYt.dashEmbed .spotFrame{height:80px!important;flex:none}#tourYt.spot.dashEmbed .gen{display:none!important}#tourYt .spotFrame iframe{width:100%!important;height:100%!important;border:0}'
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
      + '#tourYt.dashEmbed .foot{display:none}#tourYt.dashEmbed .gen{order:-1}';
    document.head.appendChild(css);
    wrap = document.createElement('div');
    wrap.id = 'tourYt';
    wrap.innerHTML = '<div class="hd" data-yt-drag="1">'
      + '<span class="drag" title="Drag">⠿</span>'
      + '<span class="hdLabel">MUSIC</span>'
      + '<span class="miniTtl" id="tourYtMiniTitle">Music</span>'
      + '<span class="acts">'
      + '<button type="button" data-yt-min="1" title="Minimize">—</button>'
      + '<button type="button" data-yt-prev="1" title="Previous">⏮</button>'
      + '<button type="button" data-yt-next="1" title="Next">⏭</button>'
      + '<button type="button" data-yt-auto="1" title="Autoplay next">Auto ▶</button>'
      + '<button type="button" data-yt-radio="1" title="Houston radio stations">Radio</button>'
      + '<button type="button" data-yt-spot="1" title="Spotify player (free embed — full songs if you are logged in to Spotify in this browser, 30-second previews otherwise)">Spotify</button>'
      + '<button type="button" data-yt-off="1" title="Stop music">■</button>'
      + '</span></div>'
      + '<div class="body">'
      + '<div class="host"><div id="tourYtMount"></div></div>'
      + '<div class="row"><span class="ttl" id="tourYtTitle">Music off</span></div>'
      + '</div>'
      + '<div class="row gen" style="display:flex;flex-wrap:wrap;gap:4px;padding:4px 8px">' + GENRES.map(([k, n]) => '<button type="button" data-yt-genre="' + k + '" style="font-size:11px;padding:3px 7px;border-radius:10px;border:1px solid #34404c;background:' + (k === genre ? '#1f6f43' : '#1b232c') + ';color:#dbe6f0">' + n + '</button>').join('') + '</div>'
      + '<div class="foot" id="tourYtFoot">Shuffle · ' + ALL.length + ' songs</div>';
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
    wrap.querySelectorAll('[data-yt-genre]').forEach((b) => b.addEventListener('click', (e) => { e.stopPropagation(); setGenre(b.getAttribute('data-yt-genre')); }));
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
    bindDrag();
    syncAutoBtn();
    syncFoot();
    if (pos.min) setMinimized(true);
    applyPos();
  }

  function bindDrag() {
    let drag = null;
    wrap.addEventListener('pointerdown', (e) => {
      if (driverMode) return;
      const handle = e.target.closest('[data-yt-drag]');
      if (!handle || e.target.closest('button,a,iframe,input,select')) return;
      const r = wrap.getBoundingClientRect();
      if (!wrap.classList.contains('placed')) {
        pos.x = r.left; pos.y = r.top;
        applyPos();
      }
      drag = { dx: e.clientX - r.left, dy: e.clientY - r.top, id: e.pointerId };
      try { wrap.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      e.preventDefault();
    });
    wrap.addEventListener('pointermove', (e) => {
      if (!drag || e.pointerId !== drag.id || driverMode) return;
      const c = clampPos(e.clientX - drag.dx, e.clientY - drag.dy);
      pos.x = c.x; pos.y = c.y;
      wrap.style.left = c.x + 'px';
      wrap.style.top = c.y + 'px';
    });
    const end = (e) => {
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
    if (!opts.fromHistory && idx >= 0 && idx !== next) history.push(idx);
    if (history.length > 80) history.splice(0, history.length - 80);
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
    if (history.length) {
      playAt(history.pop(), { fromHistory: true });
      return;
    }
    playAt(idx <= 0 ? ALL.length - 1 : idx - 1, { fromHistory: true });
  }

  function playRandom() { playNext(); }

  /** Visually pin over the driver dash (left of RPM) without moving the DOM node. */
  function placeDashOverlay() {
    const dashEl = document.getElementById('tourDash');
    if (!wrap || !dashEl || !dashEl.classList.contains('on')) return;
    const r = dashEl.getBoundingClientRect();
    if (r.width < 8 || r.height < 8) return;
    const put = (l, t, w2, h2) => {
      wrap.style.left = Math.round(l) + 'px'; wrap.style.top = Math.round(t) + 'px';
      wrap.style.width = Math.round(w2) + 'px'; wrap.style.height = Math.round(h2) + 'px';
      wrap.style.right = 'auto'; wrap.style.bottom = 'auto';
    };
    const gen = wrap.querySelector('.row.gen'); if (gen) gen.style.display = 'flex';
    /* car dashes reserve a free panel on the passenger side (#dMediaSlot): the player fills it when it is on screen,
       otherwise (narrow phones crop the dash) it sits as a compact bar just above the dash, clear of the gauges */
    const slot = dashEl.querySelector('#dMediaSlot');
    if (slot) {
      const b = slot.getBoundingClientRect(), vw = window.innerWidth;
      const l = Math.max(6, b.left), rr = Math.min(vw - 6, b.right);
      if (rr - l >= 180 && b.height >= 100) { put(l, b.top, rr - l, b.height); return; }
      /* slot cropped (iPad portrait, phones): compact player (no genre chips) docked on the lower passenger dash,
         so the windshield stays clear */
      if (gen) gen.style.display = 'none';
      const w2 = Math.min(300, vw - 16), h2 = Math.min(140, Math.max(104, r.height * 0.4));
      put(Math.max(4, Math.min(vw - w2 - 8, rr - w2)), Math.max(r.top + 4, r.bottom - h2 - 6), w2, h2); return;
    }
    let w = Math.min(r.width * 0.24, 268, window.innerWidth * 0.24);
    let h = Math.min(r.height * 0.58, 210, window.innerHeight * 0.28);
    let left = r.left + r.width * 0.016;
    let top = r.bottom - r.height * 0.14 - h;
    /* Car dashes: never cover the left gauge cluster (pickup fuel/temp dials, SUV/van screens).
       Sit in the gap left of it when there is room, otherwise just above it. */
    let gl = 1e9, gt = 1e9, gr = -1e9;
    dashEl.querySelectorAll('.dLeft').forEach((el) => {
      const b = el.getBoundingClientRect();
      if (b.width > 0) { gl = Math.min(gl, b.left); gt = Math.min(gt, b.top); gr = Math.max(gr, b.right); }
    });
    if (gr > gl) {
      const room = gl - r.left - 14;
      if (room >= 170) {
        w = Math.min(w, room - 4); left = r.left + 8;
      } else {
        w = Math.max(170, Math.min(w, gr - Math.max(4, r.left + 8)));
        h = Math.min(h, 150, Math.max(110, gt - 10));
        left = r.left + 8; top = gt - h - 10;
      }
    }
    wrap.style.left = Math.max(4, left) + 'px';
    wrap.style.top = Math.max(4, top) + 'px';
    wrap.style.width = Math.max(160, w) + 'px';
    wrap.style.height = Math.max(120, h) + 'px';
    wrap.style.right = 'auto';
    wrap.style.bottom = 'auto';
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

  /* Keep API stable for tour.js (genre APIs become no-ops) */
  /* genre: shuffle only that genre's songs and start one straight away */
  function setGenre(g) {
    genre = GENRES.some(([k]) => k === g) ? g : 'all';
    order = ALL.map((t, i) => (genre === 'all' || t.g === genre ? i : -1)).filter((i) => i >= 0);
    if (!order.length) order = ALL.map((_, i) => i);
    shuffle(order); shuffleCursor = 0;
    if (wrap) wrap.querySelectorAll('[data-yt-genre]').forEach((b) => { b.style.background = b.getAttribute('data-yt-genre') === genre ? '#1f6f43' : '#1b232c'; });
    if (foot) foot.textContent = 'Shuffle · ' + (GENRES.find(([k]) => k === genre) || [0, 'All'])[1] + ' · ' + order.length + ' songs';
    if (!on) setOn(true); else playNext();
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
