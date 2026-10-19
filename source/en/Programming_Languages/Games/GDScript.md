# gdscript — consolidated language guide

## GDScript

### Mental model
GDScript is used by the Godot engine; scripts attach to nodes and respond to lifecycle callbacks.

### Minimal source sample
```text
extends Node
var score := 0
func _ready() -> void:
    score += 1
    print(score)
```

### Experiment to carry out
Attach a script to a node in an empty scene and compare _ready with _process callback frequency.

### A specific failure to distinguish
Node ownership and scene-tree lifecycle matter; a method may never run if the node was not instantiated or entered the tree.

To evaluate the exercise, record the initial input, predicted behavior and actual observation in a compatible GDScript environment. Add a second run changing only one variable or argument; this makes the comparison attributable to a concrete cause. If the required runtime is not installed, treat the example as unexecuted source analysis and never label an imagined output as a passing test.

## GDScript — Expanded practice workbook

### Build the correct runtime context
GDScript depends on the Godot scene tree; a script copied into a random Python or Node command line will not run. Create a Godot 4 scene with a plain `Node` root and attach the following script:

~~~gdscript
extends Node
signal score_changed(total: int)
var score: int = 0

func add_points(points: int) -> void:
    if points < 0:
        return
    score += points
    score_changed.emit(score)

func _ready() -> void:
    score_changed.connect(_on_score_changed)
    add_points(3)
    add_points(0)
    add_points(-2)
    assert(score == 3)

func _on_score_changed(total: int) -> void:
    print(total)
~~~

This exercise predicts the signal outputs `3` and `3`, and a final stored score of 3; a rejected negative update emits no signal. Verify in Godot's output panel, not in a web page. It was not executed under an installed Godot editor here.

### Describe the invariant
The rule is **score never decreases through `add_points`**. A method that accepts a negative input by adding it would violate this rule. Decide if rejection should return a boolean or send an explicit error signal rather than being silent; different game designs need different feedback. Signals notify listeners, but the authoritative state remains the `score` variable.

### Compare ready and per-frame updates
`_ready` runs after the node enters the scene tree. Do not move score mutation into `_process(delta)` without understanding that it executes on many frames and would repeatedly add points. Likewise, a connected signal handler should not write back to the same state without a guard that prevents a loop.

### Independent extension
Attach a UI `Label`, connect `score_changed` and update text only when the value changes. Test a new scene instance, positive values, zero and invalid negative input; confirm that there are no duplicate signal connections after scene reload. Capture engine version, scene structure and output. Documentation: https://docs.godotengine.org/en/stable/tutorials/scripting/gdscript/

## GDScript — Focused mastery pathway

### Scene contract
Create a Godot 4 scene with a CharacterBody2D called Player, a CollisionShape2D child and at least two StaticBody2D walls with collision shapes. Configure Input Map actions ui_left and ui_right for keyboard; add explicit touch buttons later. Godot 3 KinematicBody2D scripts are *not* API-compatible with this Godot 4 example.

### Player.gd (attach to Player)
~~~gdscript
extends CharacterBody2D

@export var move_speed: float = 180.0
@export var gravity: float = 980.0

func _physics_process(delta: float) -> void:
    var axis: float = Input.get_axis("ui_left", "ui_right")
    velocity.x = axis * move_speed
    if not is_on_floor():
        velocity.y += gravity * delta
    else:
        velocity.y = 0.0
    move_and_slide()
~~~

The physics tick updates velocity in pixels/second. Multiplying horizontal velocity by delta again would slow the movement incorrectly; move_and_slide performs its own time-aware step in Godot 4. Gravity uses delta because it changes velocity over time. Collisions depend on correctly sized shapes and layers, not just the script.

### Test a real scene
1. Hold right for roughly one second and measure world-space displacement; repeat at different rendering frame rates with the same physics tick rate.
2. Check that left gives negative X, right positive X, and pressing both cancels. Verify the Input Map rather than silently reversing signs to hide misconfiguration.
3. Drop the player onto a wall/floor and check whether is_on_floor becomes true; record collision layers and mask.
4. Pause using get_tree().paused=true. Decide which UI node processes while paused (Process Mode: When Paused), otherwise no input can resume the game.
5. On Android, give touch controls actions matching the same Input Map; verify multiple simultaneous touches and that dragging outside controls still scrolls a web page where applicable.

### Deliverable
Keep a small reproducible scene tree, project.godot, action bindings, platform versions and a before/after video or measured positions. A script without a scene is not a validated collision test.

## GDScript — Technical notes and common pitfalls

### Core knowledge

1. GDScript is associated with the Godot engine and its node/event model.
2. Signals decouple producers from receivers but still need lifecycle-aware connections.
3. A scene-local script may rely on engine APIs unavailable outside Godot.

## GameMaker Language

### Mental model
GameMaker Language drives game objects through events such as Create and Step, with runtime-specific instance variables.

### Minimal source sample
```text
// Create event
speed_x = 2;
// Step event
x += speed_x;
```

### Experiment to carry out
Trace horizontal movement for three frames, then clamp the coordinate to a visible room boundary.

### A specific failure to distinguish
Variable names and built-in instance fields can collide with engine conventions; check the current engine's reference.

To evaluate the exercise, record the initial input, predicted behavior and actual observation in a compatible GameMaker_Language environment. Add a second run changing only one variable or argument; this makes the comparison attributable to a concrete cause. If the required runtime is not installed, treat the example as unexecuted source analysis and never label an imagined output as a passing test.
