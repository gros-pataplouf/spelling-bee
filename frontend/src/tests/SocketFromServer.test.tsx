import { describe, test, expect, beforeEach } from "vitest";
import { render, fireEvent, waitFor, getByText } from "@testing-library/react";
import { Server, WebSocket } from "mock-socket";
import { GameState } from "../types/types";
import { BrowserRouter } from "react-router-dom";

import App from "../App";
global.WebSocket = WebSocket;
const websocketServer = new Server("ws://localhost:5000");
let clientMessages: GameState[] = [];
websocketServer.on("connection", (socket) => {
  socket.on("message", (message) => {
    const parsedData: GameState = JSON.parse(JSON.stringify(message));
    clientMessages.push(parsedData);
  });
});

describe("<Game/>", () => {
  beforeEach(() => {
    clientMessages = [];
  });
  test("the frontend renders random letters from the websocket servers into the polygons", async () => {
    const game = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>,
    );
    const button = game.container.querySelector("button") as HTMLElement;
    fireEvent(
      getByText(button, "Play"),
      new MouseEvent("click", {
        bubbles: true,
      }),
    );
    websocketServer.emit("message", JSON.stringify({ letters: "ABCDEFG" }));
    await waitFor(() =>
      expect(game.container.querySelector("text")?.textContent).toBe("A"),
    );
    const letterArrayBefore = Array.from(
      game.container.querySelectorAll("#hive>svg>text"),
    ).map((node) => node.textContent);
    expect(letterArrayBefore.join("")).toBe("ABCDEFG");
  });

  test("Frontend displays warning messages from the backend", async () => {
    const game = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>,
    );
    const button = game.container.querySelector("button") as HTMLElement;
    fireEvent(
      getByText(button, "Play"),
      new MouseEvent("click", {
        bubbles: true,
      }),
    );

    websocketServer.emit("message", JSON.stringify({ warning: "not a word" }));
    return waitFor(async () => {
      expect(game.container.querySelector("#message")).toHaveTextContent(
        "not a word",
      );
    });
  });

  test("Frontend displays points sent from the backend", async () => {
    const game = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>,
    );
    const button = game.container.querySelector("button") as HTMLElement;
    fireEvent(
      getByText(button, "Play"),
      new MouseEvent("click", {
        bubbles: true,
      }),
    );
    websocketServer.emit("message", JSON.stringify({ points: 3 }));
    return waitFor(async () => {
      await expect(game.container.querySelector("#points")).toHaveTextContent(
        "3",
      );
    });
  });

  test("There is a list of already guessed words sent by the server", async () => {
    const game = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>,
    );
    const button = game.container.querySelector("button") as HTMLElement;
    fireEvent(
      getByText(button, "Play"),
      new MouseEvent("click", {
        bubbles: true,
      }),
    );
    websocketServer.emit(
      "message",
      JSON.stringify({ words: ["POCKET", "POKE"] }),
    );
    return waitFor(async () => {
      expect(game.container.querySelectorAll("#words>li").length).toBe(2);
    });
  });
  test("On reception of a point, the frontend displays a success message", async () => {
    const game = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>,
    );
    const button = game.container.querySelector("button") as HTMLElement;
    fireEvent(
      getByText(button, "Play"),
      new MouseEvent("click", {
        bubbles: true,
      }),
    );
    websocketServer.emit(
      "message",
      JSON.stringify({ points: 3, success: "Excellent!" }),
    );
    return waitFor(async () => {
      expect(game.container.querySelector("#successMessage")).toHaveTextContent(
        "Excellent!",
      );
      expect(game.container.querySelector("#successPoints")).toHaveTextContent(
        "+3",
      );
    });
  });
});
