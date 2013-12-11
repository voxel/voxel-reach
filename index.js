// # vim: set shiftwidth=2 tabstop=2 softtabstop=2 expandtab:

var ever = require('ever');
var inherits = require('inherits');
var EventEmitter = require('events').EventEmitter;

module.exports = function(game, opts) {
  return new Reach(game, opts);
}

function Reach(game, opts) {
  this.game = game;
  opts = opts || {};
  opts.reachDistance = opts.reachDistance || 8;
  opts.mouseButton = opts.mouseButton || 0; // left

  this.opts = opts;
  this.currentTarget = null;

  this.enable();
}


Reach.prototype.enable = function() {
  var self = this;

  // Continuously fired events while button is held down (from voxel-engine)
  function fire(target, state) {
    var action, hit, target;

    action = self.action(state);
    if (!action) {
      return;
    }

    target = self.specifyTarget();

    if (action === 'mining' && (this.currentTarget || target)) {
      // changing target while mouse held (moving mouse)
      if (!targetsEqual(target, this.currentTarget)) {
        self.emit('stop mining', this.currentTarget);
        self.emit('start mining', target);
      }
    }
    this.currentTarget = target;

    self.emit(action, target);
  }

  // Edge triggered
  // TODO: refactor
  function mousedown(ev) {
      if (ev.button !== self.opts.mouseButton) return; 
      self.emit('start mining', self.specifyTarget());
  }

  function mouseup(ev) {
    if (ev.button !== self.opts.mouseButton)  return;
    self.currentTarget = null;
    self.emit('stop mining', self.specifyTarget());
  }

  this.game.on('fire', fire);
  ever(document.body).on('mousedown', mousedown);
  ever(document.body).on('mouseup', mouseup);

  // Save callbacks for removing in disable()
  this.fire = fire;
  this.mousedown = mousedown;
  this.mouseup = mouseup;
};

Reach.prototype.disable = function() {
  this.game.removeListener('fire', this.fire);
  ever(document.body).removeListener('mousedown', this.mousedown);
  ever(document.body).removeListener('mouseup', this.mouseup);
};

/* Get fractional part of a number
  Math.floor(f) + frac(f) === f
  frac(3.5) = 0.5
  etc.
 */
function frac(f) {
  return Math.abs(f % 1);
}

function targetsEqual(a, b) {
  var strA = (a && a.voxel) ? a.voxel.join(',') : 'none';
  var strB = (b && b.voxel) ? b.voxel.join(',') : 'none';
  return strA === strB;
}

// Raytrace and get the hit voxel, side, and subcoordinates
Reach.prototype.specifyTarget = function() {
  var voxel, adjacent, sub, side, hit;

  hit = this.game.raycastVoxels(this.game.cameraPosition(), this.game.cameraVector(), this.opts.reachDistance);

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

  return {voxel: hit.voxel, adjacent: hit.adjacent, side: side, sub: sub, normal: hit.normal};
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
    console.log("undefined event!");
    return undefined;
  }
};

inherits(Reach, EventEmitter);
