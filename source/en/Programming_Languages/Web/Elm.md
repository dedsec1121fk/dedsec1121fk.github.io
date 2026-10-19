# elm — consolidated language guide

## Elm

### The functional boundary

Elm is a functional language for browser interfaces. A function transforms values without modifying a shared variable; browser effects are represented separately by the Elm runtime. Before building a Model/Msg/update application, learn what a small transformation actually discards.

Save the following as src/Main.elm in a scratch project initialized with elm init:

~~~elm
module Main exposing (main)

import Html exposing (text)

main =
    let
        raw =
            [ "3", "oops", "4" ]

        valid =
            List.filterMap String.toInt raw
    in
    text (String.fromInt (List.sum valid))
~~~

Build with elm make src/Main.elm --output=main.js, then load the generated script from a small HTML page and initialize Elm.Main.init on a real DOM node. The displayed value should be 7. Elm dependencies may require a network connection or a populated package cache for the first build.

### A subtle correctness failure

String.toInt returns Maybe Int: Just n for a parsed integer and Nothing for an invalid string. List.filterMap keeps Just values and silently discards Nothing. Therefore ["oops"] displays 0 even though no valid number was supplied. That is not a trustworthy validation strategy when every input must be accounted for.

Compare three cases: ["3", "4"] → 7; ["3", "oops", "4"] → 7 but with lost data; ["oops"] → 0. Explain why the same sum does not imply the same input quality. A production importer should return an explicit error, for example Result String (List Int), instead of dropping malformed records.

### Troubleshooting and next step

If elm make reports missing elm.json, run elm init in a clean directory. If dependencies cannot be downloaded, record an environment failure rather than claiming a syntax error. If the page is blank, check browser console, generated file path and Elm.Main.init. If a type mismatch occurs, distinguish Maybe Int from Int and avoid unchecked conversion.

Exercise: implement parseAll : List String -> Result String (List Int) so the second and third test inputs fail with a useful message. Then add a Model, Msg and update to display the error in the browser. Record the Elm compiler version, build result and actual browser output. The example's outcomes are statically predicted; compiler/browser execution was not performed for this text.

## Elm — Expanded practice workbook

### A concrete UI boundary

Browser.sandbox can model input without a server. Store the user's raw text as String, convert only when validating, and render feedback with Html.text so the input is displayed as text rather than interpreted as markup. This is client-side feedback, not a substitute for server-side validation when data eventually crosses a network boundary.

In an elm init scratch project, save as src/Main.elm:

~~~elm
module Main exposing (main)

import Browser
import Html exposing (Html, div, input, label, text)
import Html.Attributes exposing (for, id, value)
import Html.Events exposing (onInput)

type alias Model =
    { raw : String }

type Msg
    = Changed String

init : Model
init =
    { raw = "" }

update : Msg -> Model -> Model
update msg model =
    case msg of
        Changed next ->
            { model | raw = next }

describe : String -> String
describe raw =
    case String.toInt raw of
        Just age ->
            if age >= 0 && age <= 120 then
                "Accepted: " ++ String.fromInt age
            else
                "Out of range"

        Nothing ->
            "Enter a whole number"

view : Model -> Html Msg
view model =
    div []
        [ label [ for "age" ] [ text "Age (0–120)" ]
        , input [ id "age", value model.raw, onInput Changed ] []
        , div [] [ text (describe model.raw) ]
        ]

main : Program () Model Msg
main =
    Browser.sandbox { init = init, update = update, view = view }
~~~

Build with elm make src/Main.elm --output=main.js and initialize Elm.Main.init with a real DOM node. An Elm compiler and dependencies are required; this workbook does not claim the build was run here.

### Test matrix and rationale

Expected observations: empty text → Enter a whole number; 0 → Accepted: 0; 120 → Accepted: 120; -1 and 121 → Out of range; 12.5 and abc → Enter a whole number. String.toInt returns Maybe Int, so Nothing is handled explicitly. The boundary check is inclusive. For text such as <img src=x>, Html.text does not create an image element.

Check the visible label and its matching for/id relationship with keyboard and screen-reader inspection. Consider adding an aria-live status region and an explicit error association for a production form; merely displaying a message is not sufficient evidence of accessible error announcement.

### Diagnostics, exercises and completion

- If compilation reports a type mismatch, inspect the Msg constructor argument and onInput callback: onInput supplies String, not Int.
- If the label does not focus the input, compare for="age" and id="age".
- If typing does nothing, verify the app was initialized once and the script actually loaded.
- Exercise A: extract validateAge : String -> Result String Int and distinguish malformed input from out-of-range input.
- Exercise B: add a Submit message and explain why server-side checks remain mandatory before persisting data.
- Exercise C: test whitespace such as " 12 " and document whether String.toInt accepts it; do not silently assume trimming.

A complete submission includes Elm version, code, build/browser evidence, the seven expected input cases, an accessibility observation and a deliberate failure. No browser or Elm compiler execution is asserted for this written example.

## Elm — Focused mastery pathway

### What the Elm Architecture separates

Elm represents state with a Model, events with a Msg union type, transitions with update and rendering with view. Browser.sandbox is suitable for this entirely local example: there are no HTTP commands or subscriptions. Unlike direct DOM mutation, the runtime renders the view from the model after each message.

In a scratch Elm project created with elm init, save the following as src/Main.elm. A working package cache or access to Elm's package registry may be needed for the first build.

~~~elm
module Main exposing (main)

import Browser
import Html exposing (Html, button, div, text)
import Html.Events exposing (onClick)

type alias Model =
    { count : Int }

type Msg
    = Increment
    | Reset

init : Model
init =
    { count = 0 }

update : Msg -> Model -> Model
update msg model =
    case msg of
        Increment ->
            { model | count = model.count + 1 }

        Reset ->
            { model | count = 0 }

view : Model -> Html Msg
view model =
    div []
        [ button [ onClick Increment ] [ text "Add one" ]
        , button [ onClick Reset ] [ text "Reset" ]
        , text (String.fromInt model.count)
        ]

main : Program () Model Msg
main =
    Browser.sandbox { init = init, update = update, view = view }
~~~

Compile with elm make src/Main.elm --output=main.js. Open a disposable HTML file that loads main.js and initializes Elm.Main.init({ node: document.getElementById("app") }) on an empty div with id app. Do not inject new HTML into the same node after Elm owns it.

### Predict and test

Starting from 0, clicking Add one twice must display 2; Reset returns 0. Clicking Reset immediately also yields 0. update does not modify its input record; it returns a new model. The Elm runtime handles event dispatch and DOM updates, not the update function itself.

A deliberately invalid edit, { model | count = "one" }, should be rejected because count is Int. This is a compile-time type mismatch, not a browser exception. Browser.sandbox cannot issue Cmd Msg; asynchronous HTTP requires a suitable program such as Browser.element and an explicit update result containing commands.

### Troubleshooting and next level

- If elm make reports a missing elm.json or dependencies, run elm init in a clean project and verify network/cache access; distinguish setup failure from source failure.
- If Elm.Main is undefined, inspect the generated file path, script load order and browser console. Compilation alone does not prove browser initialization.
- If the counter appears twice, check for duplicate initialization or multiple app containers, not a second update call.
- Extend Msg with Decrement and prevent negative counts using max 0 (model.count - 1). Explain why the invariant count >= 0 holds after every message.

Completion requires the compiler version, build command, browser observation for two increments and reset, a captured type-error diagnostic, and an invariant argument. The sample and outcomes are statically reasoned; no Elm runtime execution is claimed here.
