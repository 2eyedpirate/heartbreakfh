"use client";
import { useState, useEffect, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════════
   STYLES
═══════════════════════════════════════════════════════════════ */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700&family=Outfit:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --hot: #ff1a5e; --fire: #ff4500; --rose: #ff6b9d; --ember: #ff8c42;
    --deep: #07000f; --void: #0d0018; --card: rgba(255,26,94,0.045);
    --glass: rgba(255,255,255,0.025); --border: rgba(255,26,94,0.15);
    --borderW: rgba(255,255,255,0.06); --text: #f5eaf0; --muted: #7a6070;
    --serif: 'Cormorant Garamond', Georgia, serif;
    --sans: 'Outfit', sans-serif;
  }
  html, body { background: var(--deep); color: var(--text); font-family: var(--sans); min-height: 100vh; overflow-x: hidden; }
  button { font-family: var(--sans); }
  @keyframes hb { 0%,100%{transform:scale(1)} 14%{transform:scale(1.18)} 28%{transform:scale(1)} 42%{transform:scale(1.12)} 70%{transform:scale(1)} }
  @keyframes fadeUp { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }
  @keyframes slideR { from{opacity:0;transform:translateX(-18px)} to{opacity:1;transform:translateX(0)} }
  @keyframes slideUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
  @keyframes glow { 0%,100%{box-shadow:0 0 18px rgba(255,26,94,0.35)} 50%{box-shadow:0 0 45px rgba(255,26,94,0.65),0 0 80px rgba(255,26,94,0.2)} }
  @keyframes burn { 0%,100%{text-shadow:0 0 12px #ff1a5e,0 0 25px #ff1a5e88} 50%{text-shadow:0 0 25px #ff4500,0 0 50px #ff1a5e,0 0 80px #ff1a5e44} }
  @keyframes pulse { 0%,100%{opacity:0.4} 50%{opacity:1} }
  @keyframes scanH { from{transform:translateX(-100%)} to{transform:translateX(100vw)} }
  @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
  @keyframes flicker { 0%,100%{opacity:1} 92%{opacity:1} 93%{opacity:0.6} 94%{opacity:1} 96%{opacity:0.8} 97%{opacity:1} }
  @keyframes particlePop { 0%{opacity:1;transform:translate(0,0) scale(1)} 100%{opacity:0;transform:translate(var(--tx),var(--ty)) scale(0.2)} }
  @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-4px)} 40%{transform:translateX(4px)} 60%{transform:translateX(-3px)} 80%{transform:translateX(3px)} }
  @keyframes dayPop { 0%{transform:scale(0.7);opacity:0} 60%{transform:scale(1.08)} 100%{transform:scale(1);opacity:1} }
  @keyframes choiceIn { from{opacity:0;transform:translateX(-12px) scale(0.98)} to{opacity:1;transform:translateX(0) scale(1)} }
  @keyframes outcomePop { 0%{opacity:0;transform:scale(0.96) translateY(8px)} 100%{opacity:1;transform:scale(1) translateY(0)} }
  @keyframes gradientShift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
  @keyframes vibeFlash { 0%{opacity:0;transform:translate(-50%,-50%) scale(0.5)} 25%{opacity:1;transform:translate(-50%,-50%) scale(1.05)} 60%{opacity:1;transform:translate(-50%,-50%) scale(1)} 100%{opacity:0;transform:translate(-50%,-50%) scale(0.95)} }
`;

/* ═══════════════════════════════════════════════════════════════
   SCENARIO DATA — SOFIA (player is male)
═══════════════════════════════════════════════════════════════ */
const SOFIA_EVENTS = [
  {
    day: 1, title: "FIRST CONTACT", mood: "🌹",
    reflection: "Something about her made the whole room irrelevant. You haven't spoken yet and you're already in trouble.",
    scene: `Rooftop party. City humming forty floors below, warm air carrying music and the faint smell of rain. You notice Sofia before she notices you — which lasts exactly six seconds.

Then her eyes find yours across the crowd. She doesn't look away. Neither do you. The conversation happening without words is already more interesting than anything else at this party.

She's talking to someone. She's not listening to them.

Eventually she drifts your way — casual, unhurried, like she had somewhere better to be and chose this instead.

"You were staring," she says. Not an accusation. Almost like a compliment.`,
    choices: [
      { text: `"You were counting. That's more interesting than staring."`, effects: { attraction:14, trust:3, tension:18, respect:10, composure:5 }, outcome: `She blinks — then laughs. A real one, not the social kind. "Okay. That was good." She stays. The party shrinks to just the two of you.`, vibe: "⚡ SHARP RETURN" },
      { text: `"Guilty. You made it difficult not to."`, effects: { attraction:10, trust:10, tension:12, respect:8, composure:5 }, outcome: `Something softens at the corner of her mouth. "I'll take that." She leans against the railing beside you. This is going somewhere.`, vibe: "🔥 HONEST PULL" },
      { text: `Hold eye contact. Say nothing. Let her wonder what you're thinking.`, effects: { attraction:16, trust:0, tension:22, respect:6, composure:8 }, outcome: `The silence stretches five full seconds. She tilts her head. "You're strange." But she doesn't leave. She leans in slightly instead.`, vibe: "🧊 LOADED SILENCE" },
      { text: `"Sorry. Wasn't trying to make you uncomfortable."`, effects: { attraction:-6, trust:5, tension:-5, respect:-8, composure:-5 }, outcome: `"I wasn't uncomfortable." She looks mildly disappointed — like you just answered a test wrong. She moves on politely.`, vibe: "💔 FUMBLED" },
    ],
  },
  {
    day: 2, title: "THE MORNING AFTER THE NIGHT BEFORE", mood: "☀️",
    reflection: "You exchanged numbers. She texted first — just three words — and now you can't stop smiling like an idiot.",
    scene: `10:43 AM. Your coffee is getting cold. You've reread her text four times.

*"Last night was unexpected."*

Three words. Unreadable. Is that good unexpected or bad unexpected? You're already writing five different replies in your head and deleting all of them.

She's online right now. The cursor blinks.

This is the moment the whole thing either catches or dies.`,
    choices: [
      { text: `"Unexpected is my favourite kind of evening. When's the next one?"`, effects: { attraction:15, trust:6, tension:16, respect:10, composure:5 }, outcome: `Typing indicator appears immediately. Disappears. Appears again. Then: "You don't waste time." Then: "Saturday." Your coffee is definitely cold now. You don't care.`, vibe: "🔥 INSTANT DATE" },
      { text: `Wait forty minutes. Then reply: "Same."`, effects: { attraction:14, trust:2, tension:20, respect:6, composure:10 }, outcome: `Her reply comes in eleven seconds flat. "That's all you've got?" You can feel her smiling through the screen. The tension just became a game and you're both winning.`, vibe: "🧊 POWER PAUSE" },
      { text: `"Unexpected how? Good or bad — I need to know."`, effects: { attraction:8, trust:16, tension:10, respect:12, composure:3 }, outcome: `Long pause. Then: "Definitely good. Just... didn't see you coming." Something honest in that. A door just opened — slightly.`, vibe: "💛 REAL QUESTION" },
      { text: `"Me too! It was so fun, we should totally do it again!!"`, effects: { attraction:-8, trust:3, tension:-10, respect:-6, composure:-3 }, outcome: `"...yeah for sure :)" You've seen that emoticon before. It means the opposite of what it says. Too eager. Dial it back.`, vibe: "💔 TOO MUCH" },
    ],
  },
  {
    day: 3, title: "COFFEE AND DANGER", mood: "☕",
    reflection: "First real time alone with her. Daylight. Nowhere to hide. This is where people become real — or don't.",
    scene: `Small café, mid-afternoon. Corner table. Sofia arrived two minutes before you and already has her coffee — which tells you something about her.

She looks different in daylight. More real. Less like an idea you've been building in your head and more like an actual person who is about to find out if you're interesting.

The conversation has been good. Effortless, even — which is rare enough that you both noticed it.

Then she sets down her cup, looks at you with something direct in her eyes, and says:

"Tell me something true about yourself. Something you don't usually tell people."`,
    choices: [
      { text: `Tell her something real. Something small but specific and genuinely yours.`, effects: { attraction:10, trust:22, tension:8, respect:18, composure:5 }, outcome: `She's quiet for a moment after you say it. Then: "Thank you for that." She tells you something back. Nobody does that unless they mean it. The afternoon stretches longer than it was supposed to.`, vibe: "💛 OPEN BOOK" },
      { text: `"I don't know you well enough yet. Ask me again on day ten."`, effects: { attraction:18, trust:5, tension:20, respect:12, composure:8 }, outcome: `She raises an eyebrow. "Day ten?" "You'll see." She taps her coffee cup slowly, studying you. "Okay. Day ten." The game just got a name.`, vibe: "😈 THE PROMISE" },
      { text: `"That I've been thinking about this conversation since Saturday."`, effects: { attraction:14, trust:14, tension:16, respect:10, composure:3 }, outcome: `She doesn't look away. "That's not nothing." The café noise fades. For ten seconds it's just the two of you and the weight of something beginning.`, vibe: "🔥 PURE HONESTY" },
      { text: `Deflect with a joke. Keep it light, keep it safe.`, effects: { attraction:-5, trust:-8, tension:-5, respect:-10, composure:3 }, outcome: `She smiles — but something in her eyes dims slightly. She was offering real and you handed her a shield. She finishes her coffee a little faster after that.`, vibe: "💔 MISSED MOMENT" },
    ],
  },
  {
    day: 4, title: "HIDDEN TOUCH", mood: "👐",
    reflection: "The distant burn combusts tension — Sofia obsessed, trust low, volatile and hot.",
    scene: `Secluded park bench at dusk. Leaves rustling, city fading. Sofia sits close, but her phone vibrates — a flirty message from a colleague. She silences it, fingers brushing yours accidentally. Electric.

Twilight casts her in gold. She's concealing the pull — jealousy is her weapon.

"Why fight it?" she murmurs, eyes daring.`,
    choices: [
      { text: `Grab her hand. "Because you're mine now."`, effects: { attraction:18, trust:-8, tension:25, respect:12, composure:-10 }, outcome: `She gasps, pulling you in for a kiss. "Prove it." The moment explodes, passionately.`, vibe: "🔥 POSSESSIVE GRIP" },
      { text: `Glance at her phone. "Answer it — I dare you."`, effects: { attraction:15, trust:0, tension:28, respect:5, composure:8 }, outcome: `She deletes it. "No need." Tension spikes, the air thick with unspoken desire.`, vibe: "⚡ REVERSE JEALOUSY" },
      { text: `"Honestly, I can't share you anymore."`, effects: { attraction:10, trust:20, tension:15, respect:18, composure:0 }, outcome: `"Then don't." She leans in, vulnerability raw in the fading light.`, vibe: "💛 DESPERATE PLEA" },
      { text: `Snatch her phone. "Who is he?"`, effects: { attraction:-15, trust:-22, tension:12, respect:-20, composure:-18 }, outcome: `She yanks it back, standing. "Invasive!" Walks off. Trust shattered.`, vibe: "💔 PRIVACY BREACH" },
    ],
  },
  {
    day: 5, title: "DANCE FLOOR FIRE", mood: "💃",
    reflection: "The reverse jealousy obsesses Sofia — trust cautious, the dynamic hot and dangerous.",
    scene: `Throbbing club. Strobe lights pulsing, bodies sweaty. Sofia's dancing with a handsome stranger, hips swaying provocatively, glancing your way — teasing.

He pulls her closer. She lets him, testing. Bass thumps in your veins. She's hiding craving, fueling your fire.

She breaks free, breathless: "Join or watch?"`,
    choices: [
      { text: `Cut in, pull her close. "My turn."`, effects: { attraction:20, trust:-10, tension:28, respect:15, composure:-12 }, outcome: `The stranger fades. She melts against you. "Dominant." The dance turns electric.`, vibe: "🔥 BODY TAKEOVER" },
      { text: `Dance solo nearby. Make him leave by making her want you more.`, effects: { attraction:18, trust:5, tension:30, respect:10, composure:12 }, outcome: `She ditches him, syncing with you. "Clever." Jealousy flips — thrillingly.`, vibe: "⚡ SOLO LURE" },
      { text: `"Honestly, watching that killed me inside."`, effects: { attraction:12, trust:22, tension:18, respect:20, composure:-8 }, outcome: `"Sorry... come here." She pulls you in. Honesty sparks a deep connection.`, vibe: "💛 PAIN SHARED" },
      { text: `Shove him away. "Hands off!"`, effects: { attraction:-18, trust:-25, tension:15, respect:-22, composure:-20 }, outcome: `Bouncers intervene. She fumes. "Idiot!" Night ruins in chaos.`, vibe: "💔 AGGRESSIVE BLOWUP" },
    ],
  },
  {
    day: 6, title: "INTIMATE WHISPERS", mood: "🛋️",
    reflection: "The solo lure draws Sofia deeper — trust opening, tension combusting spicily.",
    scene: `Her lavish apartment. Candles flickering, silk sheets inviting. Sofia's pouring wine — but a knock at the door. Her persistent admirer, flowers in hand.

She hesitates, eyes on you. The wine tastes bitter. She's torn. Admiration for your calm is growing.

"Handle this?" she asks, voice husky.`,
    choices: [
      { text: `Send him away. "She's taken — leave."`, effects: { attraction:22, trust:-5, tension:25, respect:18, composure:-10 }, outcome: `Door slams. She pounces. "My knight." The night erupts in passion.`, vibe: "🔥 DOOR SLAM DOMINANCE" },
      { text: `Let her decide. Watch intently, arms crossed.`, effects: { attraction:20, trust:8, tension:28, respect:12, composure:15 }, outcome: `She turns him down coldly. "Satisfied?" The tension leads to a heated embrace.`, vibe: "⚡ WATCHFUL CONTROL" },
      { text: `"Honestly, choose me or I'm gone."`, effects: { attraction:15, trust:25, tension:20, respect:22, composure:0 }, outcome: `"You." Door closes. Vulnerabilities pour — intimacy, profound.`, vibe: "💛 CHOICE CONFESSION" },
      { text: `Confront him physically. Pick a fight.`, effects: { attraction:-20, trust:-28, tension:18, respect:-25, composure:-22 }, outcome: `Scuffle ensues. She ejects both of you. "Barbaric!" The bond fractures.`, vibe: "💔 FIST FUMBLE" },
    ],
  },
  {
    day: 7, title: "STREET CONFRONTATION", mood: "🌧️",
    reflection: "The watchful control values Sofia — breaking tension, steady composure emerging.",
    scene: `Rain-slicked streets, neon reflecting in puddles. Sofia's arm is in yours — but her ex appears, blocking the path, pleading desperately.

She tenses, glancing at you. Umbrellas pass. She's hiding loyalty. Jealousy is storming.

"Back off," she snaps, weakly.`,
    choices: [
      { text: `Step forward. "She's mine — vanish."`, effects: { attraction:25, trust:-8, tension:28, respect:20, composure:-12 }, outcome: `He retreats. A rain kiss follows. "Saviour." Adrenaline fuels desire.`, vibe: "🔥 RAINY STANDOFF" },
      { text: `Stay calm. "Your choice, Sofia." Don't move.`, effects: { attraction:22, trust:10, tension:30, respect:15, composure:18 }, outcome: `She rejects him firmly. "Impressive restraint." The bond intensifies.`, vibe: "⚡ CALM COMMAND" },
      { text: `"Honestly, this tears me apart."`, effects: { attraction:18, trust:28, tension:22, respect:25, composure:-5 }, outcome: `"I know — it's over." The ex leaves. Emotional floodgates open.`, vibe: "💛 STORMY HONESTY" },
      { text: `Punch him. "Stay away forever!"`, effects: { attraction:-22, trust:-30, tension:20, respect:-28, composure:-25 }, outcome: `Police sirens. She's horrified. "Monster!" Rain washes away all trust.`, vibe: "💔 VIOLENT RAGE" },
    ],
  },
  {
    day: 8, title: "BALCONY BREAK", mood: "🏙️",
    reflection: "Calm command in the rain — Sofia admires you, golden stats combusting climactically.",
    scene: `Her balcony, overlooking a twinkling city. Wind cool. A call from a rival suitor — she answers, laughing flirtatiously before hanging.

Eyes meet yours. Guilty. Daring. Stars mock you. She's testing limits, the bond golden yet fragile.

"Jealous?" she teases, stepping close.`,
    choices: [
      { text: `Pull her against the railing. "Damn right. Show me loyalty."`, effects: { attraction:28, trust:12, tension:-15, respect:22, composure:-8 }, outcome: `She blocks his next call mid-kiss. "All yours." The city witnesses the passion.`, vibe: "🔥 EDGE CLAIM" },
      { text: `Cross arms. "End it — or I do."`, effects: { attraction:25, trust:15, tension:30, respect:25, composure:20 }, outcome: `She complies, smirking. "Bossy." Tension builds to an explosive release.`, vibe: "⚡ BALCONY ULTIMATUM" },
      { text: `"Honestly, I crave you exclusively."`, effects: { attraction:22, trust:30, tension:25, respect:28, composure:0 }, outcome: `"Mutual." Call deleted. The deepest secrets shared above the city lights.`, vibe: "💛 HEIGHTS VULNERABILITY" },
      { text: `Grab her phone and hang up for her.`, effects: { attraction:-25, trust:-35, tension:15, respect:-30, composure:-28 }, outcome: `She snatches it back. "Controlling freak!" The night ends in fallout.`, vibe: "💔 OVERREACH CRASH" },
    ],
  },
  {
    day: 9, title: "DRIVE DESIRE", mood: "🛣️",
    reflection: "The balcony ultimatum bonds profoundly — admired respect, high-stakes jealousy drive.",
    scene: `Winding coastal road. Sunset blazing, convertible top down. Sofia's phone rings — her ex, begging back.

She hesitates. Wind whipping her hair. Eyes pleading for your lead. The ocean roars below. She's committed, but old flames tempt.

"Ignore it?" she asks, hand on your thigh.`,
    choices: [
      { text: `Swerve over, kiss her fiercely. "Mine only."`, effects: { attraction:30, trust:-10, tension:28, respect:25, composure:-15 }, outcome: `Phone tossed aside. You pull over. "Wild." Sunset seals everything.`, vibe: "🔥 ROADSTOP HEAT" },
      { text: `"Answer it. Then block him forever."`, effects: { attraction:28, trust:18, tension:30, respect:28, composure:22 }, outcome: `She does, ending it cleanly. "Free now." The drive turns triumphant, intimate.`, vibe: "⚡ CONTROLLED END" },
      { text: `"Honestly, let's leave the past behind us."`, effects: { attraction:25, trust:30, tension:25, respect:30, composure:-10 }, outcome: `"Agreed." Phone silenced. Truths flow with the wind.`, vibe: "💛 COASTAL PACT" },
      { text: `Grab the wheel erratically. "Stop the car!"`, effects: { attraction:-28, trust:-35, tension:20, respect:-30, composure:-30 }, outcome: `Screeching halt. She's terrified. "Reckless!" The bond veers off a cliff.`, vibe: "💔 DANGEROUS SWERVE" },
    ],
  },
  {
    day: 10, title: "ECLIPSE CONFESSION", mood: "🌅❤️",
    reflection: "The controlled end golden-hours your connection — the climax demands absolute stakes.",
    scene: `Private yacht at twilight. Waves lapping. The horizon blazing. Sofia's rival boards uninvited — confessing love dramatically, dropping to one knee.

She stands stunned, turning to you. Salt spray stings. This is the finale. It tests everything you've built.

"Help me choose," she whispers. Urgent.`,
    choices: [
      { text: `Shove him overboard. "She's chosen."`, effects: { attraction:30, trust:20, tension:-20, respect:30, composure:-15 }, outcome: `He swims away. She laughs, then pulls you close. "My protector." Victory sails.`, vibe: "🔥 DRAMATIC EJECTION" },
      { text: `Stare him down. "Leave — or regret it."`, effects: { attraction:28, trust:30, tension:30, respect:30, composure:25 }, outcome: `He flees. She clings to you. "Masterful." An eternal vow made amid the waves.`, vibe: "⚡ SILENT THREAT" },
      { text: `"My heart's yours alone. It always has been."`, effects: { attraction:30, trust:30, tension:25, respect:30, composure:10 }, outcome: `"And mine yours." The rival dismissed. A soulful union at the edge of the world.`, vibe: "💛 OCEAN OATH" },
      { text: `Walk away. "Handle it yourself."`, effects: { attraction:-30, trust:-35, tension:15, respect:-35, composure:-35 }, outcome: `She wavers. The bond drowns. "Coward!" The yacht drifts — you drift apart.`, vibe: "💔 ABANDON SHIP" },
    ],
  },
];

/* ═══════════════════════════════════════════════════════════════
   SCENARIO DATA — ETHAN (player is female)
═══════════════════════════════════════════════════════════════ */
const ETHAN_EVENTS = [
  {
    day: 1, title: "WRONG SEAT, RIGHT PERSON", mood: "🖤",
    reflection: "You sat down next to him by accident. Or you told yourself that. You've been telling yourself that for twenty minutes.",
    scene: `Bookshop event. Reading, wine, low lighting, the kind of crowd where everyone is pretending to be more intellectual than they are. You grab the last seat — which happens to be next to someone who isn't pretending anything.

Ethan. You don't know his name yet. Right now he's just: sharp jaw, dark eyes, a book face-down in his lap, and absolutely zero interest in making small talk with anyone.

Including you, apparently.

He glances over once when you sit — takes exactly two seconds to assess you — then looks back at the speaker.

Two seconds. You felt every one of them.

The talk ends. The room stirs. He hasn't moved.`,
    choices: [
      { text: `"Good talk. Though I think you missed most of it."`, effects: { attraction:15, trust:4, tension:18, respect:10, composure:6 }, outcome: `He turns slowly. The corner of his mouth moves — barely. "I heard enough." He picks up his book. Then: "Did you?" The night just got longer.`, vibe: "⚡ FIRST SHOT" },
      { text: `Pick up the face-down book. Read the title. Say nothing.`, effects: { attraction:14, trust:2, tension:22, respect:8, composure:10 }, outcome: `He watches you. Doesn't reach for it. "Good taste?" he asks, quiet. "Depends," you say. "On the person reading it." He almost smiles. Almost.`, vibe: "🧊 SILENT MOVE" },
      { text: `"I'm [your name]. Don't make it weird." Offer your hand.`, effects: { attraction:10, trust:14, tension:10, respect:12, composure:5 }, outcome: `He looks at your hand for one beat too long. Then takes it. "Ethan." Firm grip. Doesn't let go for a second longer than necessary. "You always this direct?" "Usually," you say.`, vibe: "💛 OPEN MOVE" },
      { text: `Smile politely and look at your phone. Don't push it.`, effects: { attraction:-8, trust:3, tension:-8, respect:-5, composure:2 }, outcome: `He goes back to his book. You go back to your phone. The moment closes. You feel it close. You'll think about this one later.`, vibe: "💔 LET IT PASS" },
    ],
  },
  {
    day: 2, title: "THE TEXT YOU SENT AT MIDNIGHT", mood: "🌙",
    reflection: "He gave you his number. You waited until midnight to use it. You told yourself you were being cool. You were not being cool.",
    scene: `You texted him something clever at 12:08 AM. Witty. Just the right length. You put it down and did not stare at your phone.

You absolutely stared at your phone.

At 12:41 he replied.

Not to the clever thing. Something else entirely — a question. A real one, the kind that requires an actual answer, not a performance. Like he skipped past the version of you that was trying to impress him and went straight for the version underneath.

Your thumbs are hovering.

This reply matters more than you want it to.`,
    choices: [
      { text: `Answer his question. Honestly. No spin.`, effects: { attraction:10, trust:20, tension:12, respect:16, composure:5 }, outcome: `Three minutes pass. Then: "Huh." Then: "Okay. I wasn't expecting that." Then the conversation doesn't stop until 2 AM and neither of you mentions it.`, vibe: "💛 RAW ANSWER" },
      { text: `Answer his question with a better question back.`, effects: { attraction:16, trust:8, tension:20, respect:10, composure:8 }, outcome: `"Nice redirect," he types. Then he answers yours. Then asks another. By 1:30 you've forgotten what the original question was and it doesn't matter.`, vibe: "⚡ VOLLEY" },
      { text: `"Why do you want to know?"`, effects: { attraction:14, trust:5, tension:18, respect:8, composure:8 }, outcome: `Long pause. "Curious about you." Full stop. Three words that do something to your chest that you're not going to examine right now. You answer him.`, vibe: "🔥 PULL THE THREAD" },
      { text: `Send a voice note instead of typing. Just talk.`, effects: { attraction:18, trust:12, tension:14, respect:10, composure:3 }, outcome: `Silence for four minutes. Then his voice note comes back. Hearing his voice at midnight in your dark room is a different thing entirely than a text. You replay it twice.`, vibe: "🎙️ VOICE IN THE DARK" },
    ],
  },
  {
    day: 3, title: "THE WALK THAT WENT TOO LONG", mood: "🌆",
    reflection: "You said you'd grab coffee. That was three hours ago. Neither of you has mentioned leaving.",
    scene: `It started as coffee. Then you were walking. Then it was golden hour and you were somewhere neither of you planned to be, and the conversation had shifted into something neither of you planned to have.

Ethan stopped in front of a closed bookshop window — staring at nothing, or thinking about something — and you stood beside him in comfortable silence for a full minute.

That's when you knew. Comfortable silence on day three is not nothing.

He turns to look at you. The light is doing something unfair to his face.

"Can I ask you something that might be too much for day three?"`,
    choices: [
      { text: `"Day three is exactly when you should ask it."`, effects: { attraction:16, trust:16, tension:20, respect:14, composure:6 }, outcome: `He holds eye contact for two full seconds. "Are you always like this — or just with me?" You feel the question land in your ribs. "I'm figuring that out," you say. He nods slowly. Like that was the right answer.`, vibe: "🔥 THE QUESTION" },
      { text: `"Depends on the question. Ask it and we'll find out."`, effects: { attraction:18, trust:10, tension:22, respect:12, composure:8 }, outcome: `"Do you do this with everyone? The whole —" he gestures vaguely at the air between you "— thing." You don't answer immediately. The pause says more than any answer would.`, vibe: "⚡ THE THING" },
      { text: `"Ask it. I won't hold it against you."`, effects: { attraction:12, trust:20, tension:14, respect:18, composure:5 }, outcome: `He asks it. It's about something real — something he clearly thought about before asking. You answer honestly. He listens like it matters. The walk home after this takes twice as long as it should.`, vibe: "💛 SAFE SPACE" },
      { text: `"Too much for day three? There's no such thing."`, effects: { attraction:8, trust:8, tension:16, respect:6, composure:4 }, outcome: `He tilts his head. "You say that now." He asks it — and it IS a lot. You handle it fine. But you see something in his expression: he was testing whether you could.`, vibe: "😈 CALLED OUT" },
    ],
  },
  {
    day: 4, title: "SECRET RENDEZVOUS", mood: "🌑",
    reflection: "The whisper tease has Ethan drawn — tension combusting, respect wavering uncertainly.",
    scene: `A hidden alley behind the club. Shadows dancing from streetlights, distant bass humming. Ethan's waiting, collar up. But a text buzzes in his pocket — another woman? He pockets it quickly, eyes on you.

Intense.

His breath quickens as you approach. He's hiding the pull. Jealousy brews in the secrecy.

"Why the shadows?" he asks. Voice rough.`,
    choices: [
      { text: `Pin him against the wall. "To claim what's mine."`, effects: { attraction:18, trust:-8, tension:25, respect:12, composure:-10 }, outcome: `He groans, kissing back fiercely. "God, yes." The moment explodes — but the text haunts you.`, vibe: "🔥 WALL PRESS" },
      { text: `"Who's texting you?" Hold your hand out for the phone.`, effects: { attraction:15, trust:0, tension:28, respect:5, composure:8 }, outcome: `He hands it over. "See for yourself — nothing." Trust teeters. Tension turns addictive.`, vibe: "⚡ SUSPICIOUS PROBE" },
      { text: `"Honestly, I hate sharing your attention."`, effects: { attraction:10, trust:20, tension:15, respect:18, composure:0 }, outcome: `He deletes the contact right in front of you. "You're all I see." Intimacy surges in the dark.`, vibe: "💛 POSSESSIVE TRUTH" },
      { text: `Storm off. "Deal with her first."`, effects: { attraction:-15, trust:-22, tension:12, respect:-20, composure:-18 }, outcome: `He calls after you, desperate. "Wait!" But you leave. Your heart races in pain.`, vibe: "💔 DRAMATIC EXIT" },
    ],
  },
  {
    day: 5, title: "JEALOUSY BOIL", mood: "🔥",
    reflection: "The suspicious probe obsesses Ethan — trust volatile, the dynamic dangerously hot.",
    scene: `Crowded party. Lights flashing, bodies grinding to the beat. Ethan's dancing with an ex, her hands on his hips, laughing too close. He spots you — eyes pleading. Or challenging?

Sweat and perfume mix. Music thumps in your chest. Beneath his moves, regret simmers.

He breaks away, approaching.

"Dance with me instead?"`,
    choices: [
      { text: `Pull him from her grasp. "She's done."`, effects: { attraction:20, trust:-10, tension:28, respect:15, composure:-12 }, outcome: `He follows, bodies syncing heatedly. "You're fire." Jealousy turns to passion on the floor.`, vibe: "🔥 RIVAL SNATCH" },
      { text: `Dance nearby, ignoring him. Let him chase.`, effects: { attraction:18, trust:5, tension:30, respect:10, composure:12 }, outcome: `He ditches her, joining you. "Can't resist." The pursuit thrills — power shifting entirely.`, vibe: "⚡ CHASE GAME" },
      { text: `"Honestly, that killed me to watch."`, effects: { attraction:12, trust:22, tension:18, respect:20, composure:-8 }, outcome: `He apologizes profusely. "Never again." Vulnerability mends something amid the chaos.`, vibe: "💛 HURT CONFESS" },
      { text: `Kiss someone else to spite him.`, effects: { attraction:-18, trust:-25, tension:15, respect:-22, composure:-20 }, outcome: `Ethan's shattered. He leaves alone. "Over." The party spins into regret.`, vibe: "💔 VENGEFUL KISS" },
    ],
  },
  {
    day: 6, title: "BEDROOM CONFESSION", mood: "🛏️",
    reflection: "The chase game has Ethan obsessed — trust opening, tension combusting dangerously.",
    scene: `His bedroom at dawn. Sheets rumpled, city light filtering through the blinds. Ethan's shirtless, tracing your collarbone. But his phone lights up — her name again.

He silences it. Eyes guilty.

Coffee scent lingers from earlier. He's hiding the pull toward you, jealousy reversed.

"Tell me to block her," he whispers. Breath hot.`,
    choices: [
      { text: `"Do it now — or lose me."`, effects: { attraction:22, trust:-5, tension:25, respect:18, composure:-10 }, outcome: `He complies, then pulls you close. "Yours." The intensity peaks.`, vibe: "🔥 DOMINANT COMMAND" },
      { text: `Watch him do it silently, then kiss him slowly.`, effects: { attraction:20, trust:8, tension:28, respect:12, composure:15 }, outcome: `He blocks her, relief flooding his face. "Finally free." The act bonds you. Tension electric.`, vibe: "⚡ SILENT CONTROL" },
      { text: `"Honestly, it terrifies me how much I care."`, effects: { attraction:15, trust:25, tension:20, respect:22, composure:0 }, outcome: `He holds you tight. "Me too." Dawn brings raw, unguarded connection.`, vibe: "💛 FEAR SHARED" },
      { text: `Smash the phone against the wall. "Problem solved."`, effects: { attraction:-20, trust:-28, tension:18, respect:-25, composure:-22 }, outcome: `He recoils in shock. "Get out." Trust shatters like glass.`, vibe: "💔 RAGE OUTBURST" },
    ],
  },
  {
    day: 7, title: "PUBLIC SHOWDOWN", mood: "🥊",
    reflection: "The silent control values Ethan toward you — tension breaking, composure holding steady.",
    scene: `Busy street café. Sunlight glaring. Chatter around you. Ethan's ex approaches your table — flirting openly, hand resting on his shoulder like she owns him.

He freezes. Eyes flick to you for rescue.

Coffee steams. Tension thick as her perfume. He's torn — but admiration for your calm is building.

"Miss me?" she purrs at him.`,
    choices: [
      { text: `Stand and face her. "He's mine — back off."`, effects: { attraction:25, trust:-8, tension:28, respect:20, composure:-12 }, outcome: `She retreats. Ethan pulls you close immediately. "My hero." Adrenaline surges into desire.`, vibe: "🔥 PUBLIC CLAIM" },
      { text: `Smile coldly at her. "He's not interested. Leave."`, effects: { attraction:22, trust:10, tension:30, respect:15, composure:18 }, outcome: `She leaves huffing. Ethan grins wide. "Handled perfectly." The power dynamic turns intoxicating.`, vibe: "⚡ ICY DISMISS" },
      { text: `"Honestly, this jealousy is exhausting us both."`, effects: { attraction:18, trust:28, tension:22, respect:25, composure:-5 }, outcome: `He tells her off firmly. "We're done." Your honesty clears the air — beautifully.`, vibe: "💛 WEARY TRUTH" },
      { text: `Pour your coffee on her. "Stay away."`, effects: { attraction:-22, trust:-30, tension:20, respect:-28, composure:-25 }, outcome: `Chaos erupts. Ethan is appalled. "Insane!" The scene ends in humiliation.`, vibe: "💔 VIOLENT SNAP" },
    ],
  },
  {
    day: 8, title: "ROOFTOP CLASH", mood: "🌪️",
    reflection: "The icy dismiss admires Ethan — high stats golden, tension combusting climactically.",
    scene: `Rooftop under storm clouds. Wind whipping, the city roaring below. Ethan's pacing — a rival's message fresh, threatening your bond.

He turns. Eyes wild with conflict.

Rain starts spitting. He's hiding his fear of losing you.

"Choose: me or the drama?" he demands.`,
    choices: [
      { text: `Kiss him in the rain. "You — always."`, effects: { attraction:28, trust:12, tension:-15, respect:22, composure:-8 }, outcome: `He melts. The storm forgotten. "Forever." Passion overrides the clash entirely.`, vibe: "🔥 STORMY EMBRACE" },
      { text: `Stand firm, arms crossed. "End it all now — or I walk."`, effects: { attraction:25, trust:15, tension:30, respect:25, composure:20 }, outcome: `He deletes everything. "Done." The wind howls as the bond strengthens.`, vibe: "⚡ ULTIMATUM POWER" },
      { text: `"Honestly, I'm addicted to this chaos with you."`, effects: { attraction:22, trust:30, tension:25, respect:28, composure:0 }, outcome: `He laughs, pulling you close. "Same." Vulnerability peaks in the gale.`, vibe: "💛 ADDICT CONFESS" },
      { text: `Push him away. "I'm done with your games."`, effects: { attraction:-25, trust:-35, tension:15, respect:-30, composure:-28 }, outcome: `He begs — but you leave. "No!" Heartbreak in the rain.`, vibe: "💔 BITTER END" },
    ],
  },
  {
    day: 9, title: "CAR BREAKDOWN", mood: "🚗",
    reflection: "The ultimatum bonds deeply — respect admired, jealousy lingering in high-stakes night.",
    scene: `Deserted road at night. Car stalled, headlights cutting through fog. Ethan's under the hood — but a call from his past rings. Insistent.

He answers briefly. Voice tense.

Engine grease on his hands. Stars above. He's concealing lingering ties.

"Old flames die hard," he admits, glancing guilty.`,
    choices: [
      { text: `Slam the hood shut. "Hang up and kiss me."`, effects: { attraction:30, trust:-10, tension:28, respect:25, composure:-15 }, outcome: `He does — the car forgotten. "Irresistible." Heat builds under a blanket of stars.`, vibe: "🔥 ROAD RAGE KISS" },
      { text: `Take the phone from his hand. End the call yourself.`, effects: { attraction:28, trust:18, tension:30, respect:28, composure:22 }, outcome: `He nods, grateful. "You're right." The isolation turns profoundly intimate.`, vibe: "⚡ FORCEFUL CUT" },
      { text: `"Honestly, cut her out or lose me forever."`, effects: { attraction:25, trust:30, tension:25, respect:30, composure:-10 }, outcome: `He blocks her immediately. "Gone." The truth solidifies in the breakdown.`, vibe: "💛 ULTIMATE VOW" },
      { text: `Get back in the car and drive off alone.`, effects: { attraction:-28, trust:-35, tension:20, respect:-30, composure:-30 }, outcome: `He chases on foot. Futile. "Wait!" Abandonment echoes down the empty road.`, vibe: "💔 DESERTED HEART" },
    ],
  },
  {
    day: 10, title: "FINAL ECLIPSE", mood: "🌑❤️",
    reflection: "The forceful cut golden-hours your bond — the climax demands absolute, final choice.",
    scene: `Secluded beach at midnight. Waves crashing. Fire crackling. Ethan's ex shows up uninvited — pleading, desperate, tears on her face.

He stands between the two of you. Heart torn visibly in two.

Salt air stings. Flames dance. This is the endgame.

"Her or me?" you demand. The world holds its breath.`,
    choices: [
      { text: `Stand your ground and face her. "He's mine — go."`, effects: { attraction:30, trust:20, tension:-20, respect:30, composure:-15 }, outcome: `She flees. He pulls you into the firelight. "All yours." Victory in the surf.`, vibe: "🔥 WARRIOR WIN" },
      { text: `Walk away slowly toward the water. "Choose wisely."`, effects: { attraction:28, trust:30, tension:30, respect:30, composure:25 }, outcome: `He runs after you. "You!" The commitment seals — eternally.`, vibe: "⚡ DRAMATIC TEST" },
      { text: `"I love you. Despite everything. All of it."`, effects: { attraction:30, trust:30, tension:25, respect:30, composure:10 }, outcome: `He rejects her without hesitation. "I love you too." The climax lands in a full embrace.`, vibe: "💛 SOUL CLIMAX" },
      { text: `Cross to her side. "We're done."`, effects: { attraction:-30, trust:-35, tension:15, respect:-35, composure:-35 }, outcome: `He breaks completely. "How?" Total devastation. The waves crash on.`, vibe: "💔 BETRAYAL END" },
    ],
  },
];

/* ═══════════════════════════════════════════════════════════════
   STAT ENGINE
═══════════════════════════════════════════════════════════════ */
const ARCHETYPES = {
  "🔥 Bold":      { attraction:22, trust:8,  tension:25, respect:12, composure:5,  color:"#ff4500", desc:"You walk in like you own every room. You magnetize — you don't chase.", risk:"High ceiling. Crashes hard if trust slips." },
  "🧊 Cold":      { attraction:18, trust:5,  tension:30, respect:15, composure:18, color:"#00c8ff", desc:"Unreadable. Indifferent. Devastating when you finally show emotion.", risk:"Makes them obsess. Slow-burn masterclass." },
  "😈 Mischief":  { attraction:20, trust:8,  tension:28, respect:8,  composure:10, color:"#bf5af2", desc:"You push buttons on purpose. You enjoy the reaction a little too much.", risk:"High tension always. Wins hearts or breaks them — no middle." },
  "💛 Soft":      { attraction:12, trust:22, tension:10, respect:20, composure:20, color:"#ffd700", desc:"Emotionally intelligent. You make them feel seen like nobody else ever has.", risk:"Highest trust ceiling. Safest path. Slowest burn." },
};

const STAT_META = [
  { key:"attraction", label:"Attraction", icon:"🔥", color:"#ff1a5e", glow:"rgba(255,26,94,0.4)" },
  { key:"trust",      label:"Trust",      icon:"🤝", color:"#ffd700", glow:"rgba(255,215,0,0.4)" },
  { key:"tension",    label:"Tension",    icon:"⚡", color:"#bf5af2", glow:"rgba(191,90,242,0.4)" },
  { key:"respect",    label:"Respect",    icon:"👑", color:"#30d158", glow:"rgba(48,209,88,0.4)" },
  { key:"composure",  label:"Composure",  icon:"🧊", color:"#00c8ff", glow:"rgba(0,200,255,0.4)" },
];

function clamp(v){ return Math.max(0, Math.min(100, v)); }
function applyFx(stats, fx){ const n={...stats}; for(const [k,v] of Object.entries(fx)) if(k in n) n[k]=clamp(n[k]+v); return n; }
function checkLoss(stats){
  if(stats.trust<12) return { lost:true, reason:"They stopped trusting you. The walls went back up — and this time, they locked.", type:"trust" };
  if(stats.composure<8) return { lost:true, reason:"Your jealousy became a cage. They had to save themselves from it.", type:"composure" };
  return { lost:false };
}
function getEnding(stats){
  const score = stats.attraction + stats.trust + stats.respect;
  const win = stats.attraction >= 55 && stats.trust >= 45;
  if(!win) return { win:false, grade:"✗", title:"Not This Time", color:"#555", desc:"They cared. You could feel it. But something stayed unsaid too long — and 10 days isn't forever. Some stories need a different starting line." };
  if(score>=220) return { win:true, grade:"S", title:"Undeniable", color:"#ff1a5e", desc:"They didn't just fall for you. They chose you with both eyes open, knowing exactly who you were. That's not luck. That's you." };
  if(score>=185) return { win:true, grade:"A", title:"Inevitable", color:"#ffd700", desc:"It wasn't perfect. But it was real — and real beats perfect every single time. You earned this." };
  if(score>=155) return { win:true, grade:"B", title:"Hard-Won", color:"#bf5af2", desc:"You scraped through on grit and a few perfect moments. The foundation is there. Build on it." };
  return { win:true, grade:"C", title:"Barely", color:"#30d158", desc:"They said yes — but they're still watching. Don't waste the second chance you got." };
}

/* ═══════════════════════════════════════════════════════════════
   UI COMPONENTS
═══════════════════════════════════════════════════════════════ */
function AnimatedStatBar({ meta, value, prev, showDelta }){
  const [disp, setDisp] = useState(value);
  useEffect(()=>{
    const s=prev??value, e=value, dur=900, t0=Date.now();
    const tick=()=>{ const p=Math.min((Date.now()-t0)/dur,1), ease=1-Math.pow(1-p,3); setDisp(Math.round(s+(e-s)*ease)); if(p<1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  },[value]);
  const delta = value - (prev??value);
  const critical = meta.key==="trust"&&value<20 || meta.key==="composure"&&value<15;
  return (
    <div style={{marginBottom:9}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
        <div style={{display:"flex",alignItems:"center",gap:5}}>
          <span style={{fontSize:11}}>{meta.icon}</span>
          <span style={{fontSize:10,color:critical?"#ff453a":meta.color,letterSpacing:1.5,textTransform:"uppercase",fontWeight:500,animation:critical?"pulse 1s ease infinite":"none"}}>{meta.label}</span>
          {critical && <span style={{fontSize:8,color:"#ff453a",animation:"pulse 1s ease infinite"}}>⚠</span>}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          {showDelta && delta!==0 && <span style={{fontSize:10,fontWeight:700,color:delta>0?"#30d158":"#ff453a",animation:"fadeUp 0.4s ease"}}>{delta>0?"+":""}{delta}</span>}
          <span style={{fontSize:11,color:meta.color,fontFamily:"'Courier New',monospace",fontWeight:700}}>{disp}</span>
        </div>
      </div>
      <div style={{height:4,background:"rgba(255,255,255,0.05)",borderRadius:3,overflow:"hidden"}}>
        <div style={{height:"100%",width:`${disp}%`,background:`linear-gradient(90deg,${meta.color}66,${meta.color})`,borderRadius:3,transition:"width 0.05s linear",boxShadow:disp>50?`0 0 8px ${meta.glow}`:"none"}}/>
      </div>
    </div>
  );
}

function ChoiceBtn({ choice, idx, onClick, disabled }){
  const [hov, setHov] = useState(false);
  const [flashing, setFlashing] = useState(false);
  const vibeEmoji = choice.vibe.split(" ")[0];
  const vibeColors = {"🔥":"#ff4500","⚡":"#ffd700","💛":"#ffd700","💔":"#555","👑":"#ffd700","🧊":"#00c8ff","😈":"#bf5af2","🎙️":"#bf5af2"};
  const vc = vibeColors[vibeEmoji] || "#ff1a5e";

  const handleClick = () => {
    if(disabled) return;
    setFlashing(true);
    setTimeout(() => setFlashing(false), 500);
    onClick(choice);
  };

  return (
    <div style={{position:"relative"}}>
      <button onClick={handleClick} disabled={disabled}
        onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
        style={{
          width:"100%", background:hov?"rgba(255,26,94,0.09)":"rgba(255,255,255,0.018)",
          border:`1px solid ${hov?"rgba(255,26,94,0.35)":"rgba(255,255,255,0.07)"}`,
          borderLeft:`3px solid ${hov?vc:"rgba(255,255,255,0.04)"}`,
          borderRadius:10, padding:"13px 15px", cursor:disabled?"not-allowed":"pointer",
          textAlign:"left", color:hov?"#f5eaf0":"#8a7080", fontFamily:"var(--sans)",
          fontSize:14, lineHeight:1.6, transition:"all 0.18s ease",
          animation:`choiceIn 0.35s ease ${idx*0.07}s both`,
          transform:hov?"translateX(3px)":"translateX(0)",
          boxShadow:hov?`0 0 18px rgba(255,26,94,0.08)`:undefined, opacity:disabled?0.45:1,
        }}>
        {choice.text}
      </button>
      {flashing && (
        <div style={{
          position:"fixed", top:"50%", left:"50%",
          transform:"translate(-50%,-50%)",
          pointerEvents:"none", zIndex:9999,
          animation:"vibeFlash 0.5s ease forwards",
          display:"flex", flexDirection:"column", alignItems:"center", gap:6,
        }}>
          <span style={{fontSize:52, filter:`drop-shadow(0 0 20px ${vc})`}}>{vibeEmoji}</span>
          <span style={{
            fontSize:13, fontWeight:700, letterSpacing:3, textTransform:"uppercase",
            color:vc, textShadow:`0 0 20px ${vc}`, fontFamily:"var(--sans)",
            whiteSpace:"nowrap",
          }}>{choice.vibe.split(" ").slice(1).join(" ")}</span>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SCREENS
═══════════════════════════════════════════════════════════════ */
function TitleScreen({ onStart }){
  return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"radial-gradient(ellipse at 35% 25%, #1a000b 0%, #0a0005 45%, #000210 100%)",padding:20,position:"relative",overflow:"hidden"}}>
      {/* Ambient lines */}
      {[...Array(6)].map((_,i)=><div key={i} style={{position:"absolute",left:0,right:0,height:1,top:`${12+i*15}%`,background:`linear-gradient(90deg,transparent,rgba(255,26,94,${0.025+i*0.008}),transparent)`}}/>)}
      <div style={{maxWidth:460,width:"100%",textAlign:"center",animation:"fadeUp 0.9s ease"}}>
        <div style={{fontSize:76,marginBottom:14,animation:"hb 2.8s ease-in-out infinite, burn 3s ease-in-out infinite",display:"inline-block",filter:"drop-shadow(0 0 35px #ff1a5e)"}}>♥</div>
        <h1 style={{fontFamily:"var(--serif)",fontSize:"clamp(52px,11vw,86px)",fontWeight:700,lineHeight:0.88,margin:"0 0 10px",fontStyle:"italic",background:"linear-gradient(150deg,#fff 0%,#ff8fa0 45%,#ff1a5e 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",letterSpacing:-2}}>HEART<br/>BREAK</h1>
        <p style={{fontSize:10,color:"#ff1a5e",letterSpacing:6,margin:"0 0 20px",textTransform:"uppercase",fontFamily:"var(--sans)",fontWeight:500}}>10 DAYS · ONE CHANCE · NO MERCY</p>
        <p style={{color:"#7a6070",fontSize:15,lineHeight:1.85,margin:"0 0 40px"}}>A romantic psychological thriller. Every word you say is felt. Every silence is heard. Desire is the most dangerous game you'll ever play.</p>
        <button onClick={onStart} style={{background:"linear-gradient(135deg,#ff1a5e,#ff4500)",border:"none",borderRadius:12,padding:"17px 52px",color:"#fff",fontFamily:"var(--serif)",fontSize:20,cursor:"pointer",fontStyle:"italic",boxShadow:"0 0 35px rgba(255,26,94,0.45), 0 4px 25px rgba(0,0,0,0.6)",animation:"glow 2.5s ease-in-out infinite",letterSpacing:0.5}}
          onMouseEnter={e=>e.target.style.transform="scale(1.04)"} onMouseLeave={e=>e.target.style.transform="scale(1)"}>Begin the Game →</button>
        <p style={{color:"#3a2030",fontSize:11,marginTop:18}}>No explicit content · Emotionally intense · Fully replayable</p>
      </div>
    </div>
  );
}

function CharSelect({ onConfirm }){
  const [gender, setGender] = useState(null);
  const [arch, setArch] = useState(null);
  const [saifuuClicks, setSaifuuClicks] = useState(0);
  const [saifuuShake, setSaifuuShake] = useState(false);

  const SAIFUU_MSGS = [
    "💍 Oops — Saifuu's taken.",
    "😭 Still taken. Very taken.",
    "🚫 Babe. He's MARRIED.",
    "💀 You really tried again huh.",
    "😂 Saifuu said no.",
    "🙏 Please. Just pick Ethan.",
    "👀 This is getting embarrassing.",
    "💔 He's not coming. Choose Ethan.",
    "😤 SAIFUU. IS. TAKEN.",
    "🤦 Fine. Keep clicking. He won't appear.",
  ];

  const handleSaifuu = () => {
    setSaifuuShake(true);
    setSaifuuClicks(c => c + 1);
    setTimeout(() => setSaifuuShake(false), 500);
  };

  return (
    <div style={{minHeight:"100vh",background:"radial-gradient(ellipse at 65% 35%, #120009 0%, #0a0005 55%, #000210 100%)",padding:"24px 16px",display:"flex",alignItems:"flex-start",justifyContent:"center"}}>
      <div style={{maxWidth:520,width:"100%",paddingTop:24,animation:"fadeUp 0.5s ease"}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <p style={{fontSize:10,color:"#ff1a5e",letterSpacing:5,textTransform:"uppercase",marginBottom:10,fontWeight:500}}>Character Setup</p>
          <h2 style={{fontFamily:"var(--serif)",fontSize:38,fontStyle:"italic",marginBottom:6}}>Who Are You?</h2>
          <p style={{color:"#7a6070",fontSize:13}}>Your choices. Your archetype. Your story.</p>
        </div>

        {/* Gender */}
        <div style={{marginBottom:26}}>
          <p style={{fontSize:10,color:"#7a6070",letterSpacing:2,textTransform:"uppercase",marginBottom:12,fontWeight:500}}>Your character</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            {/* Male */}
            <button onClick={()=>{ setGender("male"); setSaifuuClicks(0); setArch(null); }} style={{background:gender==="male"?"rgba(255,26,94,0.13)":"rgba(255,255,255,0.02)",border:`1px solid ${gender==="male"?"#ff1a5e":"rgba(255,255,255,0.07)"}`,borderRadius:12,padding:"20px 14px",cursor:"pointer",color:gender==="male"?"#f5eaf0":"#7a6070",textAlign:"center",fontFamily:"var(--sans)",transition:"all 0.2s ease",boxShadow:gender==="male"?"0 0 25px rgba(255,26,94,0.22)":undefined}}>
              <div style={{fontSize:30,marginBottom:8}}>♙</div>
              <div style={{fontSize:15,fontWeight:600,marginBottom:2}}>Male</div>
              <div style={{fontSize:11,color:"#ff1a5e",marginBottom:5}}>→ Sofia</div>
              <div style={{fontSize:11,color:"#5a4050",lineHeight:1.5}}>Jasmine & spice. Eyes that assess before they soften.</div>
            </button>
            {/* Female */}
            <button onClick={()=>{ setGender("female"); setSaifuuClicks(0); setArch(null); }} style={{background:gender==="female"?"rgba(255,26,94,0.13)":"rgba(255,255,255,0.02)",border:`1px solid ${gender==="female"?"#ff1a5e":"rgba(255,255,255,0.07)"}`,borderRadius:12,padding:"20px 14px",cursor:"pointer",color:gender==="female"?"#f5eaf0":"#7a6070",textAlign:"center",fontFamily:"var(--sans)",transition:"all 0.2s ease",boxShadow:gender==="female"?"0 0 25px rgba(255,26,94,0.22)":undefined}}>
              <div style={{fontSize:30,marginBottom:8}}>♛</div>
              <div style={{fontSize:15,fontWeight:600,marginBottom:2}}>Female</div>
              <div style={{fontSize:11,color:"#ff1a5e",marginBottom:5}}>→ Ethan or...?</div>
              <div style={{fontSize:11,color:"#5a4050",lineHeight:1.5}}>You'll see.</div>
            </button>
          </div>
        </div>

        {/* Female target choice — Ethan vs Saifuu */}
        {gender === "female" && (
          <div style={{marginBottom:26,animation:"fadeUp 0.35s ease"}}>
            <p style={{fontSize:10,color:"#7a6070",letterSpacing:2,textTransform:"uppercase",marginBottom:12,fontWeight:500}}>Choose your target</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              {/* Ethan */}
              <button onClick={()=>{ setArch(null); }} style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12,padding:"20px 14px",cursor:"pointer",color:"#7a6070",textAlign:"center",fontFamily:"var(--sans)",transition:"all 0.2s ease"}}>
                <div style={{fontSize:30,marginBottom:8}}>🖤</div>
                <div style={{fontSize:15,fontWeight:600,marginBottom:2,color:"#f5eaf0"}}>Ethan</div>
                <div style={{fontSize:11,color:"#ff1a5e",marginBottom:4}}>Available ✓</div>
                <div style={{fontSize:11,color:"#5a4050",lineHeight:1.5}}>Crisp cologne. Edges that hide what he actually wants.</div>
              </button>
              {/* Saifuu */}
              <button onClick={handleSaifuu} style={{
                background: saifuuClicks > 0 ? "rgba(255,26,94,0.04)" : "rgba(255,255,255,0.02)",
                border:`1px solid ${saifuuClicks>0?"rgba(255,26,94,0.25)":"rgba(255,255,255,0.07)"}`,
                borderRadius:12, padding:"20px 14px", cursor:"pointer",
                color:"#5a4050", textAlign:"center", fontFamily:"var(--sans)",
                transition:"all 0.2s ease",
                animation: saifuuShake ? "shake 0.45s ease" : undefined,
              }}>
                <div style={{fontSize:30,marginBottom:8,filter:"grayscale(0.4)"}}>💍</div>
                <div style={{fontSize:15,fontWeight:600,marginBottom:2,color:"#7a6070"}}>Saifuu</div>
                <div style={{fontSize:11,color:"#ff453a",marginBottom:4}}>
                  {saifuuClicks === 0 ? "???" : SAIFUU_MSGS[Math.min(saifuuClicks-1, SAIFUU_MSGS.length-1)]}
                </div>
                <div style={{fontSize:11,color:"#3a2030",lineHeight:1.5}}>
                  {saifuuClicks === 0 ? "Mysterious. Intriguing. Maybe..." : saifuuClicks >= 3 ? "babe just pick ethan" : "not an option."}
                </div>
              </button>
            </div>
            {saifuuClicks >= 2 && (
              <p style={{textAlign:"center",fontSize:11,color:"#ff1a5e",marginTop:10,animation:"fadeUp 0.3s ease",fontStyle:"italic"}}>
                {saifuuClicks >= 5 ? "okay at this point just scroll down and pick ethan 💀" : "Ethan is right there. He's been waiting. 👀"}
              </p>
            )}
          </div>
        )}

        {/* Archetype — shows for male always, or female after Ethan is implicitly chosen (saifuu ignored) */}
        {(gender === "male" || (gender === "female")) && (
          <div style={{marginBottom:26,animation:"fadeUp 0.4s ease"}}>
            <p style={{fontSize:10,color:"#7a6070",letterSpacing:2,textTransform:"uppercase",marginBottom:12,fontWeight:500}}>Your personality</p>
            <div style={{display:"grid",gap:10}}>
              {Object.entries(ARCHETYPES).map(([name,data])=>(
                <button key={name} onClick={()=>setArch(name)} style={{background:arch===name?`${data.color}14`:"rgba(255,255,255,0.02)",border:`1px solid ${arch===name?data.color:"rgba(255,255,255,0.07)"}`,borderLeft:`3px solid ${arch===name?data.color:"rgba(255,255,255,0.03)"}`,borderRadius:10,padding:"14px 16px",cursor:"pointer",textAlign:"left",color:arch===name?"#f5eaf0":"#7a6070",fontFamily:"var(--sans)",transition:"all 0.2s ease",boxShadow:arch===name?`0 0 18px ${data.color}33`:undefined}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                    <span style={{fontSize:15,fontWeight:600,color:arch===name?data.color:"#ccc"}}>{name}</span>
                    <div style={{display:"flex",gap:4}}>{STAT_META.slice(0,3).map(s=><span key={s.key} style={{fontSize:8,color:s.color,background:`${s.color}22`,padding:"1px 5px",borderRadius:3}}>{s.icon}{data[s.key]}</span>)}</div>
                  </div>
                  <div style={{fontSize:13,marginBottom:2,lineHeight:1.5}}>{data.desc}</div>
                  <div style={{fontSize:11,color:"#5a4050",fontStyle:"italic"}}>{data.risk}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {gender && arch && (
          <button onClick={()=>onConfirm(gender, arch)} style={{width:"100%",background:"linear-gradient(135deg,#ff1a5e,#ff4500)",border:"none",borderRadius:12,padding:"16px",color:"#fff",fontFamily:"var(--serif)",fontSize:19,cursor:"pointer",fontStyle:"italic",boxShadow:"0 0 28px rgba(255,26,94,0.35)",animation:"fadeUp 0.3s ease",letterSpacing:0.5}}>
            Enter the Story →
          </button>
        )}
      </div>
    </div>
  );
}

function GameScreen({ ev, stats, prev, day, showOutcome, lastChoice, showDelta, gender, onChoice }){
  const name = gender==="male"?"Sofia":"Ethan";
  const scene = ev.scene.replace(/\{name\}/g, name);
  const urgency = day>=9?"🚨 FINAL DAYS":day>=7?"⚡ HEATING UP":day>=4?"🌹 BUILDING":"💭 EARLY";
  const bgX = 20+day*5, bgY = 25+day*4;
  return (
    <div style={{minHeight:"100vh",background:`radial-gradient(ellipse at ${bgX}% ${bgY}%, #1a000b 0%, #0a0005 50%, #000210 100%)`,padding:"16px",fontFamily:"var(--sans)"}}>
      <div style={{maxWidth:560,margin:"0 auto"}}>
        {/* Header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
          <span style={{fontFamily:"var(--serif)",fontSize:16,color:"#ff1a5e",fontStyle:"italic",animation:"flicker 8s ease infinite"}}>Heartbreak</span>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <span style={{fontSize:9,color:"#7a6070",letterSpacing:1.2}}>{urgency}</span>
            <span style={{fontSize:9,color:"#3a2030"}}>·</span>
            <span style={{fontSize:9,color:"#7a6070"}}>{name}</span>
          </div>
        </div>
        {/* Day */}
        <div style={{marginBottom:20}}>
          <div style={{display:"flex",alignItems:"flex-end",gap:8,marginBottom:8}}>
            <span style={{fontFamily:"var(--serif)",fontSize:68,lineHeight:1,color:day>=8?"#ff4500":"#ff1a5e",textShadow:`0 0 35px ${day>=8?"#ff450055":"#ff1a5e55"}`,fontStyle:"italic",animation:day===10?"burn 2s ease-in-out infinite":undefined}}>{day}</span>
            <span style={{color:"#3a2030",fontSize:20,paddingBottom:10,fontFamily:"var(--serif)"}}>/10</span>
            <span style={{color:"#5a4050",fontSize:11,paddingBottom:14,marginLeft:2,letterSpacing:1}}>DAYS</span>
          </div>
          <div style={{height:3,background:"rgba(255,255,255,0.04)",borderRadius:2,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${(day/10)*100}%`,background:day>=8?"linear-gradient(90deg,#ff4500,#ff1a5e)":"linear-gradient(90deg,#ff1a5e88,#ff1a5e)",transition:"width 1s ease",boxShadow:"0 0 10px rgba(255,26,94,0.35)"}}/>
          </div>
        </div>
        {/* Stats */}
        <div style={{background:"rgba(255,26,94,0.03)",border:"1px solid rgba(255,26,94,0.1)",borderRadius:14,padding:"14px 16px",marginBottom:16,backdropFilter:"blur(8px)"}}>
          {STAT_META.map(m=><AnimatedStatBar key={m.key} meta={m} value={stats[m.key]} prev={prev?.[m.key]} showDelta={showDelta}/>)}
        </div>
        {/* Event card */}
        <div style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:14,padding:"20px",marginBottom:16,borderTop:`2px solid ${day>=8?"#ff4500":"#ff1a5e"}`}}>
          <div style={{fontSize:9,color:day>=8?"#ff4500":"#ff1a5e",letterSpacing:3,textTransform:"uppercase",marginBottom:8,display:"flex",alignItems:"center",gap:8,fontWeight:500}}>
            <span>{ev.mood}</span><span>DAY {day}</span><span>·</span><span>{ev.title}</span>
          </div>
          <div style={{fontSize:11,color:"#5a4050",fontStyle:"italic",marginBottom:14,lineHeight:1.6,borderLeft:"2px solid rgba(255,26,94,0.2)",paddingLeft:10}}>{ev.reflection}</div>
          <div style={{color:"#c8b4be",fontSize:14,lineHeight:1.9}}>
            {scene.split('\n\n').map((p,i)=><p key={i} style={{marginBottom:i<scene.split('\n\n').length-1?14:0}}>{p}</p>)}
          </div>
        </div>
        {/* Outcome */}
        {showOutcome && lastChoice && (
          <div style={{background:"rgba(191,90,242,0.06)",border:"1px solid rgba(191,90,242,0.2)",borderRadius:14,padding:"16px",marginBottom:16,animation:"outcomePop 0.4s ease"}}>
            <div style={{fontSize:9,color:"#bf5af2",letterSpacing:2,textTransform:"uppercase",marginBottom:8,fontWeight:500}}>What happened</div>
            <p style={{color:"#e0c0d5",fontSize:14,lineHeight:1.85,fontStyle:"italic",marginBottom:12}}>{lastChoice.outcome.replace(/\{name\}/g,name)}</p>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {Object.entries(lastChoice.effects).map(([k,v])=>{ const m=STAT_META.find(s=>s.key===k); if(!m) return null; return <span key={k} style={{fontSize:9,fontWeight:700,color:v>0?"#30d158":"#ff453a",background:v>0?"#30d15818":"#ff453a18",border:`1px solid ${v>0?"#30d15835":"#ff453a35"}`,padding:"2px 8px",borderRadius:20}}>{m.icon} {m.label} {v>0?"+":""}{v}</span>; })}
            </div>
          </div>
        )}
        {/* Choices */}
        {!showOutcome && (
          <div style={{display:"grid",gap:10}}>
            <div style={{fontSize:9,color:"#3a2030",letterSpacing:2,textTransform:"uppercase",marginBottom:2,fontWeight:500}}>Your move</div>
            {ev.choices.map((c,i)=><ChoiceBtn key={i} choice={c} idx={i} onClick={onChoice} disabled={false}/>)}
          </div>
        )}
        {showOutcome && <div style={{textAlign:"center",color:"#3a2030",fontSize:10,animation:"pulse 1.5s ease infinite",letterSpacing:3,marginTop:8}}>· · · NEXT DAY · · ·</div>}
      </div>
    </div>
  );
}

function EndingScreen({ result, stats, onReplay }){
  const [show, setShow] = useState(false);
  useEffect(()=>{ const t=setTimeout(()=>setShow(true),300); return()=>clearTimeout(t); },[]);
  return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:result.win?"radial-gradient(ellipse at 50% 35%, #1a0008 0%, #0a0005 55%, #000210 100%)":"radial-gradient(ellipse at 50% 35%, #080808 0%, #050510 100%)",padding:20}}>
      <div style={{maxWidth:440,width:"100%",textAlign:"center",animation:"fadeUp 0.9s ease",opacity:show?1:0,transition:"opacity 0.5s ease"}}>
        <div style={{fontSize:68,marginBottom:20,filter:result.win?`drop-shadow(0 0 30px ${result.color})`:"grayscale(1)",animation:result.win?"hb 2.2s ease-in-out infinite":undefined}}>{result.win?"♥":"♡"}</div>
        <div style={{fontSize:9,color:result.color,letterSpacing:5,textTransform:"uppercase",marginBottom:10,fontWeight:500}}>{result.win?"You Won":"Game Over"}</div>
        <h2 style={{fontFamily:"var(--serif)",fontSize:46,fontStyle:"italic",color:result.win?"#f5eaf0":"#444",marginBottom:6,textShadow:result.win?`0 0 40px ${result.color}55`:"none"}}>{result.title}</h2>
        <div style={{fontSize:86,fontFamily:"var(--serif)",color:result.color,lineHeight:1,marginBottom:16,animation:result.win?"burn 3s ease-in-out infinite":"none"}}>{result.grade}</div>
        <p style={{color:"#7a6070",fontSize:15,lineHeight:1.9,marginBottom:32,fontStyle:"italic"}}>{result.desc}</p>
        <div style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.05)",borderRadius:14,padding:16,marginBottom:28,textAlign:"left"}}>
          <div style={{fontSize:9,color:"#3a2030",letterSpacing:2,textTransform:"uppercase",marginBottom:12,fontWeight:500}}>Final Stats</div>
          {STAT_META.map(m=><AnimatedStatBar key={m.key} meta={m} value={stats[m.key]} prev={stats[m.key]} showDelta={false}/>)}
        </div>
        <div style={{display:"grid",gap:10}}>
          <button onClick={onReplay} style={{background:"linear-gradient(135deg,#ff1a5e,#ff4500)",border:"none",borderRadius:12,padding:"15px",color:"#fff",fontFamily:"var(--serif)",fontSize:18,cursor:"pointer",fontStyle:"italic",boxShadow:"0 0 22px rgba(255,26,94,0.32)"}}>Play Again →</button>
          <button onClick={()=>window.location.reload()} style={{background:"transparent",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12,padding:"13px",color:"#5a4050",fontFamily:"var(--sans)",fontSize:13,cursor:"pointer"}}>Main Menu</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN APP
═══════════════════════════════════════════════════════════════ */
export default function HeartbreakRPG(){
  const [screen, setScreen] = useState("title");
  const [gender, setGender] = useState(null);
  const [arch, setArch] = useState(null);
  const [stats, setStats] = useState(null);
  const [prev, setPrev] = useState(null);
  const [day, setDay] = useState(1);
  const [dayIdx, setDayIdx] = useState(0);
  const [showOutcome, setShowOutcome] = useState(false);
  const [lastChoice, setLastChoice] = useState(null);
  const [showDelta, setShowDelta] = useState(false);
  const [endResult, setEndResult] = useState(null);
  const [finalStats, setFinalStats] = useState(null);
  const [locked, setLocked] = useState(false);

  useEffect(()=>{
    const s=document.createElement("style"); s.textContent=CSS; document.head.appendChild(s);
    return()=>document.head.removeChild(s);
  },[]);

  const events = gender==="male" ? SOFIA_EVENTS : ETHAN_EVENTS;

  function startGame(g, a){
    const archData = ARCHETYPES[a];
    const initStats = { attraction:archData.attraction, trust:archData.trust, tension:archData.tension, respect:archData.respect, composure:archData.composure };
    setGender(g); setArch(a); setStats(initStats); setPrev(null);
    setDay(1); setDayIdx(0); setShowOutcome(false); setLastChoice(null);
    setShowDelta(false); setLocked(false); setEndResult(null);
    setScreen("game");
  }

  function handleChoice(choice){
    if(locked) return;
    setLocked(true);
    const newStats = applyFx(stats, choice.effects);
    setPrev({...stats});
    setStats(newStats);
    setLastChoice(choice);
    setShowOutcome(true);
    setShowDelta(true);

    setTimeout(()=>{
      const loss = checkLoss(newStats);
      if(loss.lost){ setFinalStats(newStats); setEndResult({win:false,grade:"✗",title:"Broken",color:"#555",desc:loss.reason}); setScreen("ending"); return; }
      const nextIdx = dayIdx+1;
      if(nextIdx>=events.length){ const r=getEnding(newStats); setFinalStats(newStats); setEndResult(r); setScreen("ending"); return; }
      setDayIdx(nextIdx); setDay(nextIdx+1); setShowOutcome(false); setLastChoice(null); setShowDelta(false); setLocked(false);
    }, 3000);
  }

  const currentEvent = events[dayIdx];

  return (
    <div>
      {screen==="title" && <TitleScreen onStart={()=>setScreen("charSelect")}/>}
      {screen==="charSelect" && <CharSelect onConfirm={startGame}/>}
      {screen==="game" && stats && currentEvent && (
        <GameScreen ev={currentEvent} stats={stats} prev={prev} day={day} showOutcome={showOutcome} lastChoice={lastChoice} showDelta={showDelta} gender={gender}
          onChoice={handleChoice}/>
      )}
      {screen==="ending" && endResult && finalStats && (
        <EndingScreen result={endResult} stats={finalStats} onReplay={()=>setScreen("charSelect")}/>
      )}
    </div>
  );
}
