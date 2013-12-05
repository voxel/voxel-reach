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

  console.log("this",this);
  console.log("this.fire",this.fire);
  var self = this;
  this.game.on('fire', self.fire);
}

Reach.prototype.action = function(kb_state) {
  if (kb_state['fire']) {
    // left-click = break
    return 'break';
  } else if (kb_state['firealt']) {
    // right-click = place
    return 'place';
  // TODO: middle-click = pick
  } else {
    return undefined;
  }
}

Reach.prototype.fire = function(target, state) {
  var action, hit, voxel_target;

  console.log("in fire, this=",this);
  console.log("in fire, this.action=",this.action);
  console.log("in fire, this.game=",this.game);
  action = this.action(state);
  if (!action) {
    return;
  }

  hit = this.game.raycastVoxels(game.cameraPosition(), game.cameraVector(), opts.reachDistance);
  if (action == 'break') {
    voxel_target = hit.voxel;
  } else if (action == 'place') {
    voxel_target = hit.adjacent;
  }

  console.log("emitting",action,voxel_target);
  this.emit(action, voxel_target);
}

inherits(Reach, EventEmitter);
