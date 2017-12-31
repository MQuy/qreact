import { render, createElement, Component } from '../qreact';

const stories = [
  { name: "[Webpack] — Smart Loading Assets For Production", url: "https://hackernoon.com/webpack-smart-loading-assets-for-production-3571e0a29c2e" },
  { name: "V8 Engine Overview", url: "https://medium.com/@MQuy90/v8-engine-overview-7c965731ced4" },
];

class App extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { stories } = this.props;

    return (
      <div>
        <ul>
          {
            stories.map((story) => (
              <Story story={story} />
            ))
          }
        </ul>
      </div>
    );
  }
}

class Story extends Component {
  constructor(props) {
    super(props);
    
    this.state = { likes: Math.ceil(Math.random() * 100) };
  }
  render() {
    const { story } = this.props;
    const { likes } = this.state;
    
    return (
      <li>
        <button onClick={this.handleClick}>{likes}❤️</button>
        <a href={story.url}>{story.name}</a>
      </li>
    );
  }
  handleClick = () => {
    this.setState({
      likes: this.state.likes + 1
    })
  }
}

render(<App stories={stories} />, document.getElementById("root"));