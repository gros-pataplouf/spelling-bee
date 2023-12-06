import { describe, test, expect, beforeEach } from "vitest";
import {
  render,
  fireEvent,
  screen,
  waitFor,
  act,
  getByText,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Server, WebSocket } from "mock-socket";
import { ClientMessage } from "../types/types";
import { BrowserRouter } from "react-router-dom";

import App from "../App";
global.WebSocket = WebSocket;
const websocketServer = new Server("ws://localhost:5000");
let clientMessages: ClientMessage[] = [];
websocketServer.on("connection", (socket) => {
  socket.on("message", (message) => {
    const parsedData: ClientMessage = JSON.parse(JSON.stringify(message));
    clientMessages.push(parsedData);
  });
});

describe("<Game/>", () => {
  beforeEach(() => {
    clientMessages = [];
  });
  test("After clicking on play button, 7 polygons are visible", () => {
    const app = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>,
    );
    const button = app.container.querySelector("button") as HTMLElement;
    fireEvent(
      getByText(button, "Play"),
      new MouseEvent("click", {
        bubbles: true,
      }),
    );
    const polygons = app.container.querySelectorAll("#hive>svg>polygon");
    expect(polygons.length).toBe(7);
  });
  test("Each svg contains a text element", () => {
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

    const textBoxes = game.container.querySelectorAll("#hive>svg>text");
    expect(textBoxes.length).toBe(7);
  });

  test("There is one svg with class middleLetter", () => {
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
    const middleLetterSvg = game.container.querySelectorAll(
      "#hive>.middleLetter",
    );
    expect(middleLetterSvg.length).toBe(1);
  });

  test("If you click one letter / hive, the clicked letter appears in the input field", () => {
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

    const randomLetter =
      game.container.querySelectorAll("#hive>svg>text")[
        Math.floor(Math.random() * 7)
      ];
    let inputField = game.container.querySelector("input") as HTMLInputElement;
    const valueBefore = inputField.value || "";

    fireEvent(
      randomLetter,
      new MouseEvent("click", {
        bubbles: true,
      }),
    );
    inputField = game.container.querySelector("input") as HTMLInputElement;
    const valueAfter = randomLetter.textContent + valueBefore;
    expect(inputField).toHaveAttribute("value", valueAfter);
  });

  test("If you press one letter, (key down), it appears in the input field if it is part of the letter set", async () => {
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
    await userEvent.click(screen.getByRole("input") as HTMLInputElement);
    await userEvent.type(
      screen.getByRole("input") as HTMLInputElement,
      "ABCSOLI",
    );
    expect(screen.getByRole("input") as HTMLInputElement).toHaveAttribute(
      "value",
      "SOLI",
    );
  });

  test("Clicking the shuffle button will shuffle the letters, except for #middleLetter, which will stay the first Node", async () => {
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
    const shuffleButton = game.container.querySelector(
      "#shuffle",
    ) as HTMLButtonElement;
    expect(shuffleButton).toBeInTheDocument();
    const letterArrayBefore = Array.from(
      game.container.querySelectorAll("#hive>svg>text"),
    ).map((node) => node.textContent);
    await userEvent.click(shuffleButton);
    const letterArrayAfter = Array.from(
      game.container.querySelectorAll("#hive>svg>text"),
    ).map((node) => node.textContent);
    expect(letterArrayBefore[0]).toEqual(letterArrayAfter[0]);
    expect(letterArrayBefore.slice(1, 7)).not.toEqual(
      letterArrayAfter.slice(1, 7),
    );
  });

  test("Clicking the delete button clears one letter from the input form", async () => {
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

    const inputForm = game.container.querySelector(
      "input#input",
    ) as HTMLInputElement;
    await userEvent.type(inputForm, "SOIL");
    const deleteButton = game.container.querySelector(
      "button#delete",
    ) as HTMLButtonElement;
    await userEvent.click(deleteButton);
    expect(inputForm).toHaveAttribute("value", "SOI");
  });

  test("Pressing the enter button sends the >= 4 letter value of the input field to ws://localhost:5000", async () => {
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

    const enterButton = game.container.querySelector(
      "button#enter",
    ) as HTMLButtonElement;
    const inputForm = game.container.querySelector(
      "input#input",
    ) as HTMLInputElement;
    await userEvent.click(inputForm);
    await userEvent.type(inputForm, "SOLILOQUIST");
    await userEvent.click(enterButton);
    return waitFor(async () => {
      await expect(JSON.parse(clientMessages.at(-1)).content).toBe(
        "SOLILOQUIST",
      );
    });
  });

  test("Pressing enter (not the button) also submits the  >= 4 to ws://localhost:5000", async () => {
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

    const inputForm = game.container.querySelector(
      "input#input",
    ) as HTMLInputElement;
    await userEvent.click(inputForm);
    await userEvent.type(inputForm, "SOLILOQUIST{enter}");
    return waitFor(async () => {
      expect(JSON.parse(clientMessages.at(-1)).content).toBe("SOLILOQUIST");
    });
  });

  test("a < 4 letter input is not transmitted to ws://localhost:5000", async () => {
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

    const enterButton = game.container.querySelector(
      "button#enter",
    ) as HTMLButtonElement;
    const inputForm = game.container.querySelector(
      "input#input",
    ) as HTMLInputElement;
    await userEvent.click(inputForm);
    await userEvent.type(inputForm, "SIT");
    await userEvent.click(enterButton);
    return waitFor(async () => {
      expect(clientMessages).toStrictEqual([]);
    });
  });
  test("one click generates exactly one socket message", async () => {
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

    const enterButton = game.container.querySelector(
      "button#enter",
    ) as HTMLButtonElement;
    const inputForm = game.container.querySelector(
      "input#input",
    ) as HTMLInputElement;
    await userEvent.click(inputForm);
    await userEvent.type(inputForm, "SOIL");
    await userEvent.click(enterButton);
    return waitFor(async () => {
      expect(clientMessages.length).toBe(1);
    });
  });
  test('a < 4 letter input generates a "too short" message"', async () => {
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

    const enterButton = game.container.querySelector(
      "button#enter",
    ) as HTMLButtonElement;
    const inputForm = game.container.querySelector(
      "input#input",
    ) as HTMLInputElement;
    await userEvent.click(inputForm);
    await userEvent.type(inputForm, "SIT");
    await userEvent.click(enterButton);
    expect(screen.getByText("too short")).toBeInTheDocument();
  });

  test("if the input field changes and there is no submission, the message is deleted", async () => {
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

    const enterButton = game.container.querySelector(
      "button#enter",
    ) as HTMLButtonElement;
    const inputForm = game.container.querySelector(
      "input#input",
    ) as HTMLInputElement;
    await userEvent.click(inputForm);
    await userEvent.type(inputForm, "SIT");
    await userEvent.click(enterButton);
    await userEvent.type(inputForm, "IO");
    expect(game.container.querySelector("input#input+p")).not.toHaveTextContent(
      "too short",
    );
  });

  test("the frontend renders random from the websocket servers into the polygons", async () => {
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

  test("If the middleletter is missing, nothing is submitted to the server", async () => {
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
    websocketServer.emit("message", JSON.stringify({ letters: "EBCKPTO" }));
    await waitFor(() =>
      expect(game.container.querySelector("text")?.textContent).toBe("E"),
    );
    const enterButton = game.container.querySelector(
      "button#enter",
    ) as HTMLButtonElement;
    const inputForm = game.container.querySelector(
      "input#input",
    ) as HTMLInputElement;
    await userEvent.click(inputForm);
    await act(async () => await userEvent.type(inputForm, "KOBB"));
    await userEvent.click(enterButton);
    waitFor(async () => expect(clientMessages.length).toBe(0));
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
    websocketServer.emit("message", JSON.stringify({ points: 1 }));
    return waitFor(async () => {
      await expect(game.container.querySelector("#points")).toHaveTextContent(
        "1",
      );
    });
  });

  test("Points are added up", async () => {
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
    websocketServer.emit("message", JSON.stringify({ letters: "EBCKPTO" }));
    await waitFor(() =>
      expect(game.container.querySelector("text")?.textContent).toBe("E"),
    );
    const enterButton = game.container.querySelector(
      "button#enter",
    ) as HTMLButtonElement;
    const inputForm = game.container.querySelector(
      "input#input",
    ) as HTMLInputElement;
    await userEvent.click(inputForm);
    await act(async () => await userEvent.type(inputForm, "POCKET"));
    await userEvent.click(enterButton);
    waitFor(async () => expect(clientMessages.length).toBe(1));
    websocketServer.emit("message", JSON.stringify({ points: 3 }));
    await act(async () => await userEvent.type(inputForm, "POKE"));
    await userEvent.click(enterButton);
    waitFor(async () => expect(clientMessages.length).toBe(1));
    websocketServer.emit("message", JSON.stringify({ points: 1 }));
    return waitFor(async () => {
      expect(game.container.querySelector("#points")).toHaveTextContent("4");
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
  test("The frontend displays an input form with value 'Player 1'", async () => {
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
    return waitFor(async () => {
      expect(game.container.querySelector("#playerName")).toHaveValue(
        "Player 1",
      );
    });
  });
  test("Player 1 can change their user name", async () => {
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
    await userEvent.click(
      game.container.querySelector("input#playerName") as HTMLInputElement,
    );
    await userEvent.type(
      game.container.querySelector("input#playerName") as HTMLInputElement,
      "{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}Pataplouf",
    );
    return waitFor(async () => {
      expect(game.container.querySelector("#playerName")).toHaveValue(
        "Pataplouf",
      );
    });
  });
});
