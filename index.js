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
    var action, hit, voxel_target, sub_hit;

    action = self.action(state);
    if (!action) {
      return;
    }

    hit = self.game.raycastVoxels(game.cameraPosition(), game.cameraVector(), self.opts.reachDistance);
    if (!hit) {
      return;
    }

    // targetted voxel
    if (action == 'mining') {
      voxel_target = hit.voxel;
    } else if (action == 'place') {
      voxel_target = hit.adjacent;
    }

    // relative position within voxel which was hit (1..0), for example (0.5, 0.5) is center
    // TODO: convert to 2D taking into consideration normal
    sub_hit = [frac(hit.position[0]), frac(hit.position[1]), frac(hit.position[2])];

    self.emit(action, voxel_target, sub_hit);
  });
};

Reach.prototype.action = function(kb_state) {
  if (kb_state['fire']) {
    // left-click (hold) = mining
    return 'mining';
  } else if (kb_state['firealt']) {
    // right-click = place
    return 'place';
  // TODO: middle-click = pick
  } else {
    return undefined;
  }
};

inherits(Reach, EventEmitter);
