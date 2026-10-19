# GameMaker Language — enforce a player health invariant

## Start with a reusable GML function

~~~gml
function safe_hp(value) {
    return clamp(value, 0, 100);
}
var a = safe_hp(120);
var b = safe_hp(-5);
show_debug_message(a);
show_debug_message(b);
~~~

The predicted numbers in the GameMaker debug output are 100 and 0. The clamp function restricts numeric range, but it does not validate unexpected object or string inputs. Test it in an actual GameMaker project with the version documented.

## Connect game state to events

In the Create event initialize hp = 100. In a collision handler subtract damage through safe_hp(hp - damage). Clamping only the displayed HUD value would leave broken internal state and could trigger death handling twice.

## Failure and regression plan

Temporarily remove safe_hp from a disposable character object. Apply damage greater than 100, showing that hp falls below zero. Restore the helper and test damage 0, 100, 101 and multiple simultaneous hits. Add a deathHandled flag to ensure a death transition occurs only once. Document observed Step/Collision event order; no GameMaker run is claimed here.

## Control the death transition once
An object can receive multiple collision events before the next visible frame. A robust handler checks a dead Boolean before applying further damage and sets it at the moment hp reaches zero. Add a debug counter named deathTransitions and assert it never exceeds one during a burst of hits. Separate permanent state from visual effects: a particle burst may run once, while a health bar reads the current clamped hp continuously. Test switching rooms or restarting the game to ensure both dead and deathTransitions reset properly. A negative hp hidden by a rounded HUD is not a repaired game-state invariant.
