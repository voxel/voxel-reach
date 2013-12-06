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

Reach.prototype.bindEvents = function() {
  var self = this;

  this.game.on('fire', function(target, state) {
    var action, hit, voxel_target;

    action = self.action(state);
    if (!action) {
      return;
    }

    hit = self.game.raycastVoxels(game.cameraPosition(), game.cameraVector(), self.opts.reachDistance);
    if (!hit) {
      return;
    }

    if (action == 'mining') {
      voxel_target = hit.voxel;
    } else if (action == 'place') {
      voxel_target = hit.adjacent;
    }

    self.emit(action, voxel_target);
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
