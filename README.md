# voxel-reach

A simple module for voxel-engine to handle fire/firealt events, raycast the voxel within
reach, and send break/place events for the hit voxel.

## Installation

    npm install voxel-reach

## Example 

    var reach = require('voxel-reach');

    reach(game, {reachDistance: 8});

    game.on('interact', function(target) { 
      if (target)
        game.createBlock(target.adjacent, 1);
    });

    game.on('mining', function(target) { 
      if (target)
        game.setBlock(target.voxel, 0);
    });

## License

MIT
