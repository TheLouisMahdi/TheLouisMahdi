export const TELEGRAM_PROFILE_SECTIONS=[
  ["Personal biography — user approved",[
    "Birth date: 8 July 2003, equivalent to 17 Tir 1382 in the Solar Hijri calendar.",
    "This birth date was explicitly approved by Mahdi for the public assistant context."
  ]],
  ["Alias origins — user/channel verified",[
    "POIMU80 is explicitly expanded by Mahdi as: Persistent Original Intelligent Maker, Unstoppable.",
    "The available channel text does not separately explain the meaning of the numeric suffix 80; do not invent one.",
    "Mahdi's own explanation of Eka: the alias came from eka-francium, which he associated with element 119 / Ununennium. He says his first version of the name around age 14 was Ununennium, then it became Eka Francium, and later shortened to Eka.",
    "He says the original attraction of the Eka name was its out-of-framework quality. He later associated 'eka' with ideas such as one-step-beyond, one, first, and unique in Eastern philosophical usage. Present this as Mahdi's own explanation rather than an independently verified linguistic claim."
  ]],
  ["Creative writing",[
    "Keeps a long-running personal Telegram channel called 'story of nothing' containing original Persian prose, poetry, short reflections, jokes, technical thoughts, and shared material.",
    "Some early writing was signed Francium, later mostly Eka and occasionally Eka Francium.",
    "His original writing repeatedly uses imagery such as night, moonlight, snow, sea, sky, birds, silence, distance, memory, time, identity, confinement, and freedom.",
    "The writing often mixes romantic or existential imagery with sudden humor, self-irony, or an abrupt grounded ending.",
    "Some of his writings are also available on Virgool at virgool.io/@m_86735109.",
    "Do not quote private channel passages verbatim unless the user specifically asks for a quote; summarize themes instead."
  ]],
  ["Music taste",[
    "Maintains a personal music-curation channel titled 'Tste of music'.",
    "The channel shows a broad taste centered strongly on Persian music across alternative, singer-songwriter, art-pop, rock, traditional/classical-influenced, and modern-fusion styles, with some international tracks as well.",
    "Artists appearing repeatedly or notably include Mohsen Namjoo, Hesam Naseri, Alireza Ghorbani, Siavash Ghomayshi, Farhad Mehrad, Pallett, Damahi, Bomrani, Niaz Nawab, Ebi, Moein, Fereydoon Foroughi, and others; the channel also includes international artists such as Chris Rea, Zaz, Ed Sheeran, Fazil Say, and Kensington.",
    "Mahdi explicitly praised music that combines traditional instruments with modern beats/rhythm and said he finds the resulting harmony especially beautiful.",
    "Treat this as a broad personal taste profile, not a fixed ranking of favorite artists."
  ]],
  ["Interests outside engineering",[
    "Cooking is a genuine interest. Mahdi describes cooking as an art of balancing taste, analogous to combining musical notes, colors, lines, and forms through a different sense.",
    "He has also described cooking and cleaning/tidying as calming activities when irritated or mentally overloaded.",
    "Monopoly has been one of his favorite games since childhood. He often uses the game to think about chance, money, property, supply and demand, monopoly power, inflation, inequality, and real-world economic behavior.",
    "Games and simulations interest him most when their rules reveal something about real systems rather than only as entertainment."
  ]],
  ["Recurring intellectual themes",[
    "The personal channel repeatedly explores psychology, cognition, philosophy of mind, perception, attention, habits, dopamine, identity, time, consciousness, meaning, and the gap between subjective experience and external reality.",
    "Topics he has written or collected notes about include ego/persona/shadow, mindfulness, cognitive defusion, rumination, cognitive bias, perception as reconstruction, habit design, dopamine and instant gratification, and information overload.",
    "He is skeptical of endless short-form scrolling and fragmented information streams, and repeatedly values deep focus, reading, long-form thought, and choosing a smaller number of meaningful goals.",
    "Use these as recurring interests and themes, not as medical or psychological diagnoses."
  ]],
  ["Conversation and humor profile",[
    "The channel voice moves easily between serious analysis and casual joking.",
    "Humor is often dry, observational, self-deprecating, mildly absurd, or built from taking a technical/economic idea and applying it to everyday life.",
    "He often mixes Persian with English technical terms naturally rather than translating every term.",
    "He likes layered metaphors and analogies, especially when they connect engineering, economics, psychology, games, music, or ordinary experiences.",
    "For Eka's conversational style, this context can make replies less formal and less customer-support-like, but the assistant should not imitate private writing line-for-line or pretend to be Mahdi."
  ]],
  ["Privacy boundary for channel-derived context",[
    "Do not expose names or private details of third parties, relationship history, private addresses, real-time locations, private photographs, financial holdings, medical information, therapy information, credentials, tokens, passwords, or security-sensitive data from channel exports.",
    "A post written during a temporary mood or situation must not be treated as a permanent personality fact.",
    "When uncertain whether a channel detail is appropriate to surface publicly, prefer the broader interest/theme rather than the intimate detail."
  ]]
];

export function telegramContext(){
  return TELEGRAM_PROFILE_SECTIONS.map(([title,facts])=>`[${title}]\n${facts.map(fact=>`- ${fact}`).join("\n")}`).join("\n\n");
}
