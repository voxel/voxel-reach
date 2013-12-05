# voxel-reach

A simple module for voxel-engine to handle fire/firealt events, raycast the voxel within
reach, and send break/place events for the hit voxel.

## Installation

    npm install voxel-reach

## Example 

    var reach = require('voxel-reach');

    reach(game, {reachDistance: 8});

    game.on('place', function(at) { 
      if (at)
        game.createBlock(at, 1);
    });

    game.on('mining', function(at) { 
      if (at)
        game.setBlock(at, 0);
    });

## License

MIT
