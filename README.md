

---

# DanielCatz / reddit-frontend ![MPL 2.0](https://img.shields.io/github/license/junipf/reddit-frontend.svg)

This project aims to be a complete reddit frontend written in React. At the moment it supports most of reddit's browsing features, but lacks certain features for user interaction, such as private messages or wiki pages.

## [View live build](https://daniel-catz.netlify.app/) [![Netlify Status](https://api.netlify.com/api/v1/badges/d54858e6-3ea1-4e12-8a57-a134bf430d5d/deploy-status)](https://app.netlify.com/sites/jpf-reddit/deploys)

## Hosting

Create a netlify account where you can host(free)

Create a [reddit apps](https://www.reddit.com/prefs/apps/). as an **Installed App**

![image](https://user-images.githubusercontent.com/5420294/179425828-bacecad5-8740-4dd3-8b81-f88c9a7c0816.png)

Register the reddit app and supply it with the client ID
String under the Installed app

To host your own instance of this project, you must supply the environment variables `REACT_APP_CLIENT_ID` and `REACT_APP_REDIRECT_URI` exactly as they appear in your [reddit apps](https://www.reddit.com/prefs/apps/). 


![image](https://user-images.githubusercontent.com/5420294/179425653-d781ec15-a5f4-4eda-af5f-17fe17c94f39.png)

Set CI = false so warnings don't fail the build

![image](https://user-images.githubusercontent.com/5420294/179426018-634ad47d-ddf9-4d0d-ba65-e71bb8317b83.png)


---

# About the code

This project uses React, Redux, React Router, Stylish for CSS-in-JS, and Snoowrap for reddit API interaction.

## Structure

The project is written with `/components/` and `/containers/`, and additionally `/style/` for style-specific files, `/store/` for redux store files, and `/utils/` for various pure-JS utility functions.

`components` are multi-use components that don't rely much on other components, whereas `containers` tend to supply props to their contained `components`.

## General components

General components such as `<Button>`, `<Icon>`, and `<Dropdown>` are custom written to maintain complete control over the styling and behavior. Properities that can be passed to these components generally only affect their style.

## Parity with reddit

A major goal of this project was to have complete URL parity with reddit. Replace the host name with `reddit.com` but keep the full path name and it would load the same content on reddit.

Reddit's URL scheme has quite a few peculiarities that had to be accounted for, such as the mixed use of the path name (`.../hot`) or a query (`?sort=hot`) for the same purposes in different areas of the website. As a result, much of the basic state is stored in the URL and interpreted with React-Router.

## Styling

This project was built around having adaptive styling for UX purposes. Different posts and different communities should feel *different*.

Community colors and post flair colors are used to generate complete (or limited) color schemes based on user preference, using Stylish's `theme` system. There are both light and dark base themes the user can select from. By default the user's system theme preference is respected. The theme menu allows users to change base theme, enable or disable generated themes, and to change the accent color in the base theme.
  
## Reddit video (`reddit-video.jsx`)

Videos hosted on reddit are split into separate video and audio streams. This is undocumented in the reddit API. A custom player had to be written to manage these split streams.

React was used to syncronize changes between HTML5 `<Video>` and `<Audio>` elements. The video player UI was written completely in React. This ended up being the largest single component in terms of breadth, but not complexity.

## Limitations of Snoowrap

Snoowrap is a javascript wrapper for the reddit API, used for most requests to reddit's API. It is missing a few important features, such as using reddit's OAuth without having a logged in user. To support this, `AppOnlyOauth` (`/utils/app-only-oauth.js`) fetches the necessary auth key and then feeds it in to Snoowrap.
