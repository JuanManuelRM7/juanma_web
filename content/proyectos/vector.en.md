---
title: "Vector: my day in one direction"
description: "A native iPhone and Apple Watch app I built for myself: workouts, food, water, spending and calendar in one place, with an arrow that shows how far along the day I am."
note: "It isn't on the App Store. I use it every day and show it here as a project. The screens on this page are mock-ups with sample data."
date: 2026-11-13
layout: vector
role: "Author · design and development"
period: "2026"
org: "Personal project"
stack: [Swift, SwiftUI, SwiftData, HealthKit, WidgetKit, WatchConnectivity, EventKit, App Intents, Vision, Core Graphics, Swift Charts]
metrics:
  - value: "9"
    label: "modules in a single app"
  - value: "4"
    label: "targets: iPhone, watch, widgets and complications"
  - value: "~37,000"
    label: "lines of Swift"
  - value: "ES · EN"
    label: "following the device language, in light and dark"
tags: ["iOS", "watchOS", "SwiftUI", "product"]
---

{{< vx-row stage="phone" kicker="The idea" >}}
## One arrow instead of six rings

Each day has a handful of goals: eat enough, drink, train if it's a training day, the English question, the tasks. The number counts the ones you've met. The arrow counts partial progress too, so it moves even before you've closed any of them.

- Only what makes sense today counts: on a rest day, the workout goal isn't there.
- The same calculation on the iPhone, the watch and the widget.
{{< /vx-row >}}

{{< vx-row stage="calendar" kicker="Workouts" flip="true" >}}
## The training month at a glance

Four weeks in a grid: the previous two, the current one and the next. Done days are filled and planned ones are outlined, so what happened and what's coming never get mixed up.

- Running in orange and gym in indigo; if a day has both, half and half.
- Done days come from Health, planned ones from the system calendar.
{{< /vx-row >}}

{{< vx-row stage="share" kicker="Sharing" >}}
## Your run, with your photo and the distance behind you

To share a run you pick a photo from the library or take one on the spot. The iPhone separates whatever is in the foreground and puts the distance, huge, behind it, like a magazine cover.

- The number finds a spot on its own where you cover it a little without making it hard to read, wherever you are in the photo.
- Four route styles: Giant, painted with light, behind you or in front without covering your face; Relief, in 3D with the elevation; Trace, thin and with the kilometres; and Badge, with the stats around it.
- Everything is computed on the iPhone with Vision, offline. There's also a map card and a sticker with a transparent background.
{{< /vx-row >}}

{{< vx-block stage="watches" kicker="Apple Watch" >}}
## The whole app on your wrist

It isn't a remote for the iPhone. The watch has nine pages, one per module: you log water, food or an expense right there, start the gym routine or the run, and everything syncs back to the iPhone.

For the watch face there are complications that fit between the hour markers: days to the next race, the best time to run according to the forecast, what's left of the budget, this week's kilometres, shoe wear and the day's goals.
{{< /vx-block >}}

{{< vx-row stage="run" kicker="Running coach" >}}
## A race plan that knows when to back off

The watch reads races from the calendar and sets up the goal: distance, time and an even pace. Alerts take the whole screen: one word, the number in huge type and a green, yellow or red background depending on how you're doing, so you get them at a glance mid-run. At every kilometre, its pace and the gap to the plan. And heart rate comes before pace.

- With a sustained high heart rate it won't ask you to speed up, even if you're behind.
- If the plan is no longer reachable without overreaching, it adjusts to a realistic finish.
- With heat in the forecast it offers a longer target before you start and is more cautious during the run.
{{< /vx-row >}}

{{< vx-row stage="widgets" kicker="Widgets" flip="true" >}}
## What matters, without opening the app

Widgets for the Home Screen and the Lock Screen, in the same language as the watch alerts: big numbers, little text and a background in the colour of how you're doing. Rest between sets shows up as a Live Activity.

- This month's spending in green, yellow or red depending on the month-end projection, with a button to log another expense.
- Water fills the background as you drink, with buttons to add more without opening the app.
- Today's goals as a ring with one segment per goal, and this week's kilometres against last week's.
{{< /vx-row >}}

{{< vx-row stage="car" kicker="CarPlay · StandBy" >}}
## The training month, on the dashboard

The workout calendar also lives on the car screen. It's designed for that place: large numbers, nothing to tap and no battery drain, because it only redraws when a day changes.

- The same widget works in StandBy, with the iPhone charging in landscape.
{{< /vx-row >}}

{{< vx-block kicker="Everything inside" >}}
## Nine modules, one app
{{< /vx-block >}}

{{< vx-tiles >}}
{{< vx-tile k="Running" color="run" title="A projected time for every race" >}}It reads races from the calendar, estimates your time from your recent runs and gives you the pace per kilometre. Splits, heart-rate zones and cadence, live, plus the kilometres on each pair of shoes, with a heads-up when it's time to replace them.{{< /vx-tile >}}
{{< vx-tile k="Gym" color="gym" title="Routines you follow from the watch" >}}An exercise catalogue, sets with last time's reference, and a rest timer that stays visible even with the iPhone locked.{{< /vx-tile >}}
{{< vx-tile k="Food" color="warn" title="A calorie goal that moves with you" >}}Resting energy plus the real activity Health measures, so it rises through the day. Thousands of foods offline and a barcode scanner.{{< /vx-tile >}}
{{< vx-tile k="Spending" color="accent" title="How the month will end, not just how it's going" >}}A budget per category, yearly costs spread month by month, and a month-end projection that accounts for pending fixed costs and your variable spending rate. You can also log an expense by telling Siri or from Control Centre.{{< /vx-tile >}}
{{< vx-tile k="Water and creatine" color="water" title="Log in one tap, from wherever you are" >}}From the app, the watch, the widget or the watch face. The litre goal is yours, and creatine is ticked off when you take it.{{< /vx-tile >}}
{{< vx-tile k="Calendar and weather" color="accent" title="Every event, with its forecast" >}}System calendar and reminders in one view. Next to each event, the forecast for that place and time, and a heads-up beforehand if rain, heat or an official warning is coming.{{< /vx-tile >}}
{{< vx-tile k="English" color="gym" title="One question a day" >}}B2 and C1 vocabulary and expressions, answered from the iPhone or the watch. It counts as a goal for the day.{{< /vx-tile >}}
{{< vx-tile k="Achievements" color="warn" title="XP, levels and medals" >}}Everything you do adds up. More than a hundred medals, a streak that rewards consistency and, at the end of the year, a recap of what you ran, trained and spent.{{< /vx-tile >}}
{{< vx-tile k="Lab" color="muted" title="What moves together in your days" >}}It cross-references food, spending and training over the last 120 days: Pearson correlation with its confidence interval, a significance test and day-to-next-day relationships. It shows the scatter plot, not just the number.{{< /vx-tile >}}
{{< /vx-tiles >}}

{{< vx-block kicker="How it's built" >}}
## Native, no server and no accounts

Everything lives on the iPhone and the watch. Health data comes from Health, the schedule from the system calendar, and weather from a public forecast. There's no backend and no sign-up: the iPhone and the watch talk to each other directly and each keeps its own data.

The interface uses a palette with two values per colour, so the app and its widgets follow the system's light or dark appearance, and every string exists in Spanish and English. There are eight accent colours to choose from, all with enough contrast to read well in light and dark, each with a matching icon, and the Today screen can be arranged as you like.
{{< /vx-block >}}
