import React from "react";
// import { setUser } from "../store/actions";
import { connect } from "react-redux";
import ReactTooltip from "react-tooltip";
import Button from "../components/button";
import { setSubscriptions, setMultireddits, setUser } from "../store/actions";
import { Requester } from "../components/requester";

import { QuickNavigation } from "../components/quick-navigation";
import NavigationMenu from "../components/navigation-menu";
// import UserMenu from "../components/user-menu";
import styled from "styled-components";

const HeaderWrapper = styled.div`
  /* height: 3rem; */
  height: 100vh;
  border-right: 1px solid ${props => props.theme.container.border};
  background-color: ${props => props.theme.container.levels[1]};
  color: ${props => props.theme.container.color};
  width: 3rem;
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: space-between;
`;

const Section = styled.div`
  display: flex;
  flex-flow: inherit;
  align-items: center;
  /* height: inherit; */
  margin: 0.25rem;
`;

class Header extends React.Component {
  static contextType = Requester;
  componentDidMount() {
    if (this.props.subscriptions.length === 0) {
      // console.log("Get subscriptions. Context:", this.context);
      this.context.getSubscriptions({ limit: 1000 }).then(subscriptions => {
        this.props.setSubscriptions(subscriptions);
        // console.log("Subscriptions returned from reddit: ", subscriptions);
      });
      this.context.getMyMultireddits().then(multis => {
        this.props.setMultireddits(multis);
      });
    }
    if (this.props.user.name === undefined) {
      this.context.getMe().then(user => this.props.setUser(user));
    }
  }
  componentDidUpdate() {
    ReactTooltip.rebuild();
  }
  render() {
    const { darkTheme, toggleDarkTheme, ...rest } = this.props;
    return (
      <HeaderWrapper>
        <Section>
          <NavigationMenu {...rest} />
          <QuickNavigation favorites={rest.favorites} />
        </Section>
        <Section>
          <Button
            onClick={toggleDarkTheme}
            type="primary"
            icon={darkTheme ? "sun" : "moon"}
            label={darkTheme ? "Light mode" : "Dark mode"}
            hideLabel
          />
          {/* <UserMenu user={this.props.user} /> */}
        </Section>
      </HeaderWrapper>
    );
  }
}

function mapStateToProps(state) {
  const {
    currentSubredditName,
    subreddits,
    subscriptionNames,
    favoriteNames,
    multireddits,
    user,
  } = state;

  let favorites = [];
  let subscriptions = [];

  if (subscriptionNames) {
    subscriptions = subscriptionNames.reduce((subscriptions, name) => {
      if (subreddits[name]) subscriptions.push(subreddits[name]);
      return subscriptions;
    }, []);
  }

  if (favoriteNames) {
    favorites = favoriteNames.reduce((favorites, name) => {
      if (subreddits[name]) favorites.push(subreddits[name]);
      return favorites;
    }, []);
  }

  return {
    currentSubreddit: subreddits[currentSubredditName],
    subscriptions,
    favorites,
    currentSubredditName,
    multireddits,
    user,
  };
}

const actions = {
  setSubscriptions,
  setMultireddits,
  setUser,
};

export default connect(
  mapStateToProps,
  actions
)(Header);
