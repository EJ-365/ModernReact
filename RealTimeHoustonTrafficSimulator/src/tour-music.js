/**
 * Tour Houston music — one global shuffle pool (all styles mixed).
 * YouTube IFrame + quiet Web Audio bed if a video won't embed.
 * Floating panel, or embedded into the driver dash.
 */

const TRACKS = [
  /* Verified embeddable (YouTube oEmbed) — Oct 2026 refresh */
  { g: 'afrobeat', id: 'CQLsdm1ZYAw', title: 'Calm Down' },
  { g: 'afrobeat', id: 'jipQpjUA_o8', title: 'Essence' },
  { g: 'afrobeat', id: 'D-YDEyuDxWU', title: 'Love Nwantiti' },
  { g: 'afrobeat', id: 'lPe09eE6Xio', title: 'Ye' },
  { g: 'afrobeat', id: 'pekzpzNCNDQ', title: 'Peru' },
  { g: 'afrobeat', id: 'OSBan_sH_b8', title: 'Unavailable' },
  { g: 'afrobeat', id: 'crtQSTYWtqE', title: 'Rush' },
  { g: 'afrobeat', id: '3Iyuym-Gci0', title: 'Fall' },
  { g: 'afrobeat', id: '1VrWaED18_g', title: 'Soco' },
  { g: 'afrobeat', id: 'XoiOOiuH8iI', title: 'Water' },
  { g: 'afrobeat', id: 'bbVZo4Yw7pI', title: 'Lonely At The Top' },
  { g: 'afrobeat', id: 'Q7QiLceJSLQ', title: 'Ojuelegba' },
  { g: 'afrobeat', id: 'fXl5dPuiJa0', title: 'Joha' },
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
  { g: 'hiphop', id: 'tvTRZJ-4EyI', title: 'HUMBLE.' },
  { g: 'hiphop', id: 'xFYQQPAOz7Y', title: 'Lose Yourself' },
  { g: 'hiphop', id: 'xvZqHgFz51I', title: 'Mask Off' },
  { g: 'hiphop', id: 'PEGccV-NOm8', title: 'Bodak Yellow' },
  { g: 'hiphop', id: 'yQBImEeXNZ4', title: 'FIRST CLASS' },
  { g: 'hiphop', id: 'UceaB4D0jpo', title: 'Rockstar' },
  { g: 'hiphop', id: '7ZAYzLjQAd4', title: 'Still Tippin\'' },
  { g: 'country', id: 'bUjPPBxbQrQ', title: 'Last Night' },
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
  { g: 'afrobeat', id: '8xg3vE8Ie_E', title: 'Last Last' },
  { g: 'afrobeat', id: '1cQh1ccqu8M', title: 'Rush' },
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
  { g: 'classics', id: '8xg3vE8Ie_E', title: 'Last Last' },
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

const GENRES = [['all', 'All'], ['pop', 'Pop'], ['hiphop', 'Hip-hop / Rap'], ['rock', 'Rock'], ['electronic', 'Electronic'], ['latin', 'Latin'], ['afrobeat', 'Afrobeat'], ['gospel', 'Gospel'], ['country', 'Country'], ['classics', 'Classics']];
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
      + '#tourYt.dashEmbed .host{aspect-ratio:auto;height:auto;min-height:78px;max-height:48%}'
      + '#tourYt .host iframe{width:100%;height:100%;border:0;display:block}'
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
      + '<button type="button" data-yt-radio="1" title="Live radio for this genre (Radio Browser)">Radio</button>'
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
    /* live internet radio by genre — free station directory (radio-browser.info), HTTPS MP3/AAC streams only */
    {
      const TAG = { all: 'top 40', pop: 'pop', hiphop: 'hip hop', rock: 'rock', electronic: 'electronic', latin: 'latin', afrobeat: 'afrobeat', gospel: 'gospel', classics: 'oldies' };
      const rBtn = wrap.querySelector('[data-yt-radio]'), offBtn = wrap.querySelector('[data-yt-off]');
      let au = null, list = [], idx = 0, on = false;
      const stopRadio = () => { on = false; if (au) { au.pause(); au.src = ''; } rBtn.classList.remove('on'); };
      const playSt = () => {
        const st = list[idx % list.length]; if (!st) return;
        au = au || new Audio(); au.src = st.url_resolved; au.play().catch(() => { idx++; if (on && idx < list.length) playSt(); });
        au.onerror = () => { idx++; if (on && idx < list.length) playSt(); };
        if (label) label.textContent = '📻 ' + st.name.trim().slice(0, 60);
        if (miniLabel) miniLabel.textContent = st.name.trim().slice(0, 40);
        if (foot) foot.textContent = 'Live radio · ' + (idx % list.length + 1) + ' of ' + list.length + ' stations · radio-browser.info';
      };
      rBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (on) { idx++; playSt(); return; }
        offBtn.click(); on = true; rBtn.classList.add('on');
        if (label) label.textContent = 'Finding ' + (TAG[genre] || 'pop') + ' stations…';
        try {
          const r = await fetch('https://de1.api.radio-browser.info/json/stations/bytag/' + encodeURIComponent(TAG[genre] || 'pop') + '?limit=60&hidebroken=true&order=clickcount&reverse=true');
          list = (await r.json()).filter((x) => /^https:/.test(x.url_resolved) && /MP3|AAC/i.test(x.codec)); idx = 0;
          if (on) playSt();
        } catch (_) { if (label) label.textContent = 'Radio unavailable'; stopRadio(); }
      });
      offBtn.addEventListener('click', () => { if (on) stopRadio(); });
      wrap.querySelector('[data-yt-next]').addEventListener('click', (e) => { if (on) { e.stopImmediatePropagation(); idx++; playSt(); } }, true);
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
