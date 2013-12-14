# voxel-reach

A simple module for voxel-engine to handle fire/firealt events, raycast the voxel within
reach, and send break/place events for the hit voxel.

## Installation

    npm install voxel-reach

## Example 

    var createReach = require('voxel-reach');

    reach = createReach(game, {reachDistance: 8});

    reach.on('interact', function(target) { 
      if (target)
        game.createBlock(target.adjacent, 1);
    });

    reach.on('mining', function(target) { 
      if (target)
        game.setBlock(target.voxel, 0);
    });

## License

MIT
