// # vim: set shiftwidth=2 tabstop=2 softtabstop=2 expandtab:

var inherits = require('inherits');
var EventEmitter = require('events').EventEmitter;

module.exports = function(game, opts) {
  return new Reach(game, opts);
}

function Reach(game, opts) {
  this.game = game;
  opts = opts || {};
  opts.reachDistance = opts.reachDistance || 8;

  this.opts = opts;

  this.bindEvents();

  return this;
}

/* Get fractional part of a number
  Math.floor(f) + frac(f) === f
  frac(3.5) = 0.5
  etc.
 */
function frac(f) {
  return Math.abs(f % 1);
}

Reach.prototype.bindEvents = function() {
  var self = this;

  this.game.on('fire', function(target, state) {
    var action, hit, target;

    action = self.action(state);
    if (!action) {
      return;
    }

    hit = self.game.raycastVoxels(game.cameraPosition(), game.cameraVector(), self.opts.reachDistance);
    if (!hit) {
      return;
    }

    target = self.specifyTarget(hit, action);

    self.emit(action, target);
  });
};

// Get the hit voxel, side, and subcoordinates
Reach.prototype.specifyTarget = function(hit, action) {
  var voxel, adjacent, sub, side;

  if (!hit) {
    // air
    return false;
  }

  // relative position within voxel where it was hit, range (1..0), for example (0.5, 0.5) is center:

  // (1,1)--(0,1)
  //   |      |
  //   |      |
  // (1,0)--(0,0)

  sub = [frac(hit.position[0]), frac(hit.position[1]), frac(hit.position[2])];
  // remove coordinate from direction, since it is always 0 (within epilson); convert 3D -> 2D
  var fix = ((hit.normal.indexOf(1) + 1) || (hit.normal.indexOf(-1) + 1)) - 1; // TODO: deobfuscate
  sub.splice(fix, 1);

  side = this.normalToCardinal(hit.normal);

  return {voxel: hit.voxel, adjacent: hit.adjacent, side: side, sub: sub};
};

Reach.prototype.normalToCardinal = function(normal) {
  return {
    "1,0,0": "east", // TODO: double-check these conventions
    "-1,0,0": "west",
    "0,1,0": "top",
    "0,-1,0": "bottom",
    "0,0,1": "south",
    "0,0,-1": "north"
  }[normal];
};

Reach.prototype.cardinalToNormal = function(direction) {
  return {
    "east": [1, 0, 0],
    "west": [-1, 0, 0],
    "top": [0, 1, 0],
    "bottom": [0, -1, 0],
    "south": [0, 0, 1],
    "north": [0, 0, -1]
  }[direction];
};

Reach.prototype.action = function(kb_state) {
  if (kb_state['fire']) {
    // left-click (hold) = mining
    return 'mining';
  } else if (kb_state['firealt']) {
    // right-click = interact
    return 'interact';
  // TODO: middle-click = pick
  } else {
    return undefined;
  }
};

inherits(Reach, EventEmitter);
