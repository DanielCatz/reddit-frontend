import React, {
  useState,
  useMemo,
  useContext,
  useEffect,
  useCallback,
  Fragment,
  useRef,
} from "react";
// import ReactTooltip from "react-tooltip";
import { connect } from "react-redux";
import { setSubscriptions, setDefaults } from "./../store/actions";
import styled from "styled-components";
import ReactTooltip from "react-tooltip";

import UniqueId from "../utils/unique-id";
import SubredditIcon from "./subreddit-icon";
import { Requester } from "./requester";
import { Search, CategoryTitle } from "./dropdown";
import Input from "./input";
import Button from "./button";
import SubredditCard from "./subreddit-card";
import BasicNavigation from "./basic-navigation";
import { Spinner } from "./spinner";
import useIntersect from "../utils/use-intersect";

const HighlightSpan = ({ string, highlight, prefix = "" }) => {
  if (
    !highlight ||
    !string ||
    highlight === "" ||
    string.toLowerCase().indexOf(highlight.toLowerCase()) === -1
  )
    return <span>{prefix + string}</span>;

  const regex = new RegExp(highlight, "g");

  const parts = string.matchAll(regex);

  if (parts.length > 0) console.log(parts[0], parts[1]);

  return (
    <span>
      {prefix}
      {string.slice(0, string.toLowerCase().indexOf(highlight))}
      <Highlight>
        {string.slice(
          string.toLowerCase().indexOf(highlight),
          string.toLowerCase().indexOf(highlight) + highlight.length
        )}
      </Highlight>
      {string.slice(string.toLowerCase().indexOf(highlight) + highlight.length)}
      {/* <hr /> */}
      {/* {parts.join(" ")} */}
    </span>
  );
};

export const SubredditEntry = ({
  onClick,
  filter,
  sub,
  sub: {
    display_name: subName,
    public_description: description,
    curator,
    url,
    path,
    title,
  },
  page,
  ...props
}) => (
  <>
    <Button
      to={url || path}
      onClick={onClick}
      size={page ? "large" : null}
      fill={!page}
      flat
      data-tip={title}
      data-place="right"
    >
      <SubredditIcon sub={sub} size="small" />
      <HighlightSpan
        highlight={filter}
        string={subName}
        prefix={!!curator ? "m/" : "r/"}
      />
    </Button>
    {/* <HighlightSpan highlight={filter} string={description} /> */}
  </>
);

// const BasicEntries = () => (
//   <>
//     <Button to="/" fill flat icon="home" label="Frontpage" />
//     <Button
//       to="/r/popular"
//       fill
//       flat
//       icon="trendingUp"
//       label="Popular"
//     />
//     <Button to="/r/all" fill flat icon="barChart2" label="All" />
//   </>
// );

const SubscriptionList = ({
  // favorites,
  multireddits,
  defaults,
  subscriptions,
  page,
  setSubscriptions,
  setDefaults,
}) => {
  const r = useContext(Requester);
  const [filter, setFilter] = useState("" );
  const [searchResults, setSearchResults] = useState([]);
  const handleInput = (e) => setFilter(e.target.value.toLowerCase().trim());

  /* --> TODO <-- */
  // - Cache results per letter
  // - Set timeout before fetching results
  // - Support "r/" for subreddit name search

  const filterList = useCallback(
    (list) => {
      if (filter && filter !== "") {
        return list.reduce((filtered, sub) => {
          if (sub && sub.display_name.toLowerCase().includes(filter)) {
            filtered.push(sub);
          }
          return filtered;
        }, []);
      }
      return list;
    },
    [filter]
  );

  const filteredFavorites = useMemo(() => {
    const favorites = subscriptions.filter((sub) => sub.user_has_favorited);
    console.log("favorites", favorites);
    return filterList(favorites, filter);
  }, [subscriptions, filterList, filter]);

  const filteredSubscriptions = useMemo(
    () => filterList(subscriptions, filter),
    [subscriptions, filterList, filter]
  );
  const filteredMultireddits = useMemo(() => filterList(multireddits, filter), [
    multireddits,
    filterList,
    filter,
  ]);
  const filteredDefaults = useMemo(() => filterList(defaults, filter), [
    defaults,
    filterList,
    filter,
  ]);

  useEffect(() => {
    ReactTooltip.rebuild();
  });

  // const filterSearch = useCallback(
  //   (searchResults) => {
  //     if (searchResults !== "{}") {
  //       return searchResults.reduce((filtered, sub) => {
  //         if (
  //           sub &&
  //           subscriptions[sub.display_name] === undefined &&
  //           favorites[sub.display_name] === undefined &&
  //           defaults[sub.display_name] === undefined
  //         ) {
  //           filtered.push(sub);
  //         }
  //         return filtered;
  //       }, []);
  //     } else {
  //       return null;
  //     }
  //   },
  //   [subscriptions, favorites, defaults]
  // );

  useEffect(() => {
    if (filter !== "") {
      r.searchSubreddits({ query: filter }).then((results) => {
        console.log(results);
        // setSearchResults(filterSearch(results));
        setSearchResults(results);
      });
    }
  }, [r, filter]);

  const $scrollWrapper = useRef(null);

  // useEffect(() => {
  // console.log(defaults);
  // r.getDefaultSubreddits().then(setDefaults);
  // if (entry.isIntersecting && results && !results.isFinished) {
  // results.fetchMore().then()
  // }
  // }, [r, entry.isIntersecting]);

  const [last, setLast] = useState(null);

  useEffect(() => {
    setLast(
      searchResults && searchResults.isFinished === false
        ? { listing: searchResults, dispatch: setSearchResults }
        : defaults && defaults.isFinished === false
        ? { listing: defaults, dispatch: setDefaults }
        : subscriptions && subscriptions.isFinished === false
        ? { listing: subscriptions, dispatch: setSubscriptions }
        : null
    );
  }, [searchResults, defaults, subscriptions, setDefaults, setSubscriptions]);

  const [fetchingMore, setFetchingMore] = useState(false);

  const fetchMore = useCallback(() => {
    if (fetchingMore) return;
    if (last) {
      setFetchingMore(true);
      last.listing.fetchMore({ amount: 25 }).then((result) => {
        setFetchingMore(false);
        console.log(result);
        last.dispatch(result);
      });
    }
  }, [fetchingMore, last]);

  return (
    <>
      <Search>
        <Input
          placeholder="Search"
          onChange={handleInput}
          value={filter}
          size={page ? "large" : undefined}
        />
      </Search>
      <ScrollWrapper page={page} ref={$scrollWrapper}>
        {filter === "" && !page ? <BasicNavigation inList /> : null}
        {[
          { name: "Favorites", list: filteredFavorites },
          { name: "Collections", list: filteredMultireddits },
          { name: "Subscriptions", list: filteredSubscriptions },
          { name: "Default subreddits", list: filteredDefaults },
          { name: "Search results", list: searchResults },
        ].map(({ list, name, unfiltered }) =>
          list ? (
            <Fragment key={name}>
              {list.length > 0 ? (
                page ? (
                  <h2>{name}</h2>
                ) : (
                  <CategoryTitle key={name}>
                    {name} [{list.length}]
                  </CategoryTitle>
                )
              ) : null}
              {list.map((sub) =>
                sub ? (
                  page ? (
                    <SubredditCard
                      sub={sub}
                      key={UniqueId(sub.id)}
                      filter={filter}
                    />
                  ) : (
                    <SubredditEntry
                      sub={sub}
                      key={UniqueId(sub.id)}
                      size="small"
                      filter={filter}
                    />
                  )
                ) : null
              )}
            </Fragment>
          ) : null
        )}
        {filteredSubscriptions.length === 0 &&
        filteredFavorites.length === 0 &&
        filteredDefaults.length === 0 &&
        searchResults &&
        searchResults.length === 0 ? (
          page ? (
            <h2 key="noResults">No results</h2>
          ) : (
            <CategoryTitle key="noResults">No results</CategoryTitle>
          )
        ) : null}
        {(searchResults && !searchResults.isFinished) ||
        (defaults && !defaults.isFinished) ||
        (subscriptions && !subscriptions.isFinished) ? (
          <LoadMoreSpinner onIntersect={fetchMore} parent={$scrollWrapper} />
        ) : null}
      </ScrollWrapper>
    </>
  );
};

const LoadMoreSpinner = ({ onIntersect, parent }) => {
  const [$spinner, entry] = useIntersect({
    root: parent.current,
    threshold: 0.1,
  });

  useEffect(() => {
    if (entry.intersectionRatio > 0.1) {
      console.log(entry.intersectionRatio);
      onIntersect();
    }
  }, [entry, onIntersect]);

  return <Spinner forwardRef={$spinner} />;
};

const Highlight = styled.span`
  background-color: ${({ theme }) => theme.highlight};
`;

const ScrollWrapper = styled.div`
  min-width: 250px;
  max-height: ${({ page }) => (page ? null : "30rem")};
  height: inherit;
  overflow-y: auto;
  overflow-x: hidden;
  overflow: ${({ page }) => (page ? "visible" : null)};
  scrollbar-width: thin;
  scrollbar-color: ${({ theme }) => theme.scrollbar};
`;

export default connect(
  ({
    subreddits,
    // subscriptionNames,
    // favoriteNames,
    // defaultNames,
    subscriptions,
    defaults,
    multireddits,
    user,
  }) => {
    // const expandNames = (names) => {
    //   let list = names;
    //   list.forEach((name, i, array) => {
    //     array[i] = subreddits[name];
    //   });
    //   return list;
    // };

    return {
      // subscriptions: expandNames(subscriptionNames),
      // favorites: expandNames(favoriteNames),
      // defaults: expandNames(defaultNames),
      subscriptions,
      defaults,
      multireddits,
      user,
    };
  },
  {
    setSubscriptions,
    setDefaults,
  }
)(SubscriptionList);