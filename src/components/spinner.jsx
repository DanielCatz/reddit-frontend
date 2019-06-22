import React from "react";
import styled from "styled-components";

const SVGWrapepr = styled.div`
  position: relative;
  width: 100%;
  height: 100%;

  .spinner {
    z-index: 2;
    position: absolute;
    top: 50%;
    left: 50%;
    margin: -0.5em 0 0 -0.5em;
    width: 1em;
    height: 1em;

    animation: rotate 2s linear infinite;
    & .path {
      stroke: currentColor;
      stroke-linecap: round;
      stroke-width: 3px;
      animation: dash 1.5s ease-in-out infinite;
    }
  }

  @keyframes rotate {
    100% {
      transform: rotate(360deg);
    }
  }

  @keyframes dash {
    0% {
      stroke-dasharray: 1, 150;
      stroke-dashoffset: 0;
    }
    50% {
      stroke-dasharray: 90, 150;
      stroke-dashoffset: -35;
    }
    100% {
      stroke-dasharray: 90, 150;
      stroke-dashoffset: -124;
    }
  }
`;

export const Spinner = props => (
  <SVGWrapepr>
    <svg class="spinner" viewBox="0 0 50 50">
      <circle
        class="path"
        cx="25"
        cy="25"
        r="20"
        fill="none"
        stroke-width="3"
      />
    </svg>
  </SVGWrapepr>
);
