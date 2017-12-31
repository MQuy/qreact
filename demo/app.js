import { render, createElement } from '../qreact';

const stories = [
  { name: "[Webpack] — Smart Loading Assets For Production", url: "https://hackernoon.com/webpack-smart-loading-assets-for-production-3571e0a29c2e", likes: 339 },
  { name: "V8 Engine Overview", url: "https://medium.com/@MQuy90/v8-engine-overview-7c965731ced4", likes: 372 },
];

const appElement = (
  <div>
    <ul>{stories.map(storyElement)}</ul>
  </div>
);

function storyElement({ name, url, likes }) {
  return (
    <li>
      <span>{likes}❤️</span>
      <a href={url}>{name}</a>
    </li>
  );
}

render(appElement, document.getElementById("root"));