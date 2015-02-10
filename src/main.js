/* TODO: (test)
 *
 * Have some creeps harvesting, some creeps collecting
 * If a guard/ranger is too injured, retreat to (stdx,stdy)
 * Have rangers keep at least 1 distance
 * If all healers are injured, spawn a new healer
 * If guard/ranger injured and no enemies around, move to closet (alive) healer
 * If you are alone with enemies, move to (stdx,stdy)
 * Output info to console
*/

// Helper variables
var base = Game.spawns.Spawn1;
var harvestercount = 0;
var guardcount = 0;
var buildercount = 0;
var healercount = 0;
var rangercount = 0;

// Use for checking 
Array.prototype.contains = function(obj) 
{
    var i = this.length;
    while (i--) 
    {
        if (this[i] === obj) 
        {
            return true;
        }
    }
    return false;
};

// Filter functions
function containsAttack(object)
{
    for (var j = 0; j < object.body.length; j++)
    {
        var x = object.body[j];

        if ((x.type == Game.ATTACK || x.type == Game.RANGED_ATTACK) && x.hits>0)
        {
            return true;
        }
    }
    
    return false;
}

function shouldFlee(object)
{
    var attacksum = 0;
    var movesum = 0;
    
    for (var j = 0; j < object.body.length; j++)
    {
        var x = object.body[j];

        if (x.type == Game.ATTACK || x.type == Game.RANGED_ATTACK)
        {
            attacksum += x.hits;
        }
        else if (x.type == Game.MOVE)
        {
            movesum += x.hits;
        }
    }
    
    return (attacksum < 50 || movesum < 30);
}

function shouldFleeHealer(object)
{
    var healsum = 0;
    var movesum = 0;
    
    for (var j = 0; j < object.body.length; j++)
    {
        var x = object.body[j];

        if (x.type == Game.HEAL)
        {
            healsum += x.hits;
        }
        else if (x.type == Game.MOVE)
        {
            movesum += x.hits;
        }
    }
    
    return (healsum < 30 || movesum < 30);
}

function filter_injured(object) { return (object.hits < object.hitsMax); }

function filter_attacker(object) { return containsAttack(object); }

// Current AI parameters
var builderlimit = 0;
var healerprop = 0.25;
var rangerprop = 0.5;
var harvesterlimit = 5;
var attack_limit = 7;
var base_defense_limit = 10;
var stdx=3, stdy=34;

// Data from current timestep
var base_enemies = base.pos.findInRange(Game.HOSTILE_CREEPS, base_defense_limit);

// Get all creeps to work
for (var index in Game.creeps)
{
    var creep = Game.creeps[index];
    
    if (creep.memory.role == 'harvester')
    {
        harvestercount = harvestercount + 1;
        
        var source = base.pos.findClosest(Game.SOURCES, {ignoreCreeps: true});
        //var sources = creep.room.find(Game.SOURCES);
        
        if (creep.energy < creep.energyCapacity)
        {
            creep.moveTo(source);
            creep.harvest(source);
        }
        else
        {
            creep.moveTo(base);
            creep.transferEnergy(base);
        }
    }
    
    else if (creep.memory.role == 'guard')
    {
        if (shouldFlee(creep))
        {
            creep.moveTo(stdx,stdy);
        }
        else
        {
            guardcount = guardcount + 1;
            
            var attacking_enemies_local = creep.pos.findInRange(Game.HOSTILE_CREEPS, attack_limit, {filter: filter_attacker})
            
            if (attacking_enemies_local.length > 0 || base_enemies.length > 0)
            {
                var enemy = creep.pos.findClosest(Game.HOSTILE_CREEPS, {filter: filter_attacker});
                
                if (enemy)
                {
                    creep.moveTo(enemy);
                    creep.attack(enemy);
                }
                else
                {
                    var localenemy = creep.pos.findClosest(Game.HOSTILE_CREEPS);
                    
                    creep.moveTo(localenemy);
                    creep.attack(localenemy);
                }
            }
            else
            {
                var enemies_local = creep.pos.findInRange(Game.HOSTILE_CREEPS, attack_limit);
                
                if (enemies_local.length > 0)
                {
                    var localenemy = creep.pos.findClosest(Game.HOSTILE_CREEPS);
                    
                    creep.moveTo(localenemy);
                    creep.attack(localenemy);
                }
                else
                {
                    creep.moveTo(stdx+2,stdy-4);
                }
            }
        }
    }
    
    else if (creep.memory.role == 'ranger')
    {
        if (shouldFlee(creep))
        {
            creep.moveTo(stdx,stdy);
        }
        else
        {
            rangercount = rangercount + 1;
            
            var attacking_enemies_local = creep.pos.findInRange(Game.HOSTILE_CREEPS, attack_limit-1, {filter: filter_attacker})
            
            if (attacking_enemies_local.length > 0 || base_enemies.length > 0)
            {
                var enemy = creep.pos.findClosest(Game.HOSTILE_CREEPS, {filter: filter_attacker});
                //var targets = creep.pos.findInRange(Game.HOSTILE_CREEPS, 3);
                
                if (enemy) 
                {
                    creep.moveTo(enemy);
                    creep.rangedAttack(enemy);
                }
                else
                {
                    var localenemy = creep.pos.findClosest(Game.HOSTILE_CREEPS);
                    
                    creep.moveTo(enemy);
                    creep.attack(enemy);
                }
            }
            else
            {
                var enemies_local = creep.pos.findInRange(Game.HOSTILE_CREEPS, attack_limit);
                
                if (enemies_local.length > 0)
                {
                    var localenemy = creep.pos.findClosest(Game.HOSTILE_CREEPS);
                    
                    creep.moveTo(localenemy);
                    creep.rangedAttack(localenemy);
                }
                else
                {
                    creep.moveTo(stdx+2,stdy-3);
                }
            }
        }
    }
    
    else if (creep.memory.role == 'healer')
    {
        if (shouldFleeHealer(creep))
        {
            creep.moveTo(stdx,stdy);
        }
        else
        {
            healercount = healercount + 1;
            
            var target = creep.pos.findClosest(Game.MY_CREEPS, {filter: filter_injured});
    
            if (target) 
            {
                creep.moveTo(target);
                
                if(creep.pos.isNearTo(target)) 
                {
                    creep.heal(target);
                }
                else 
                {
                    creep.rangedHeal(target);
                }
            }
            else
            {
                creep.moveTo(stdx,stdy);
            }
        }
    }
    
    else if (creep.memory.role == 'builder')
    {
        buildercount = buildercount + 1;
        
        var targets = creep.room.find(Game.CONSTRUCTION_SITES);
			
		if(targets.length) 
		{
			creep.moveTo(targets[0]);
			creep.build(targets[0]);
		}
    }
    
    else
    {
        console.log('Creep with incorrect role!')
    }
}

// Spawn workers and builders first
if (harvestercount < harvesterlimit)
{
    base.createCreep([Game.WORK, Game.WORK, Game.MOVE, Game.CARRY, Game.MOVE], 'harvester'+harvestercount, {role:'harvester'});
}
else if (buildercount < builderlimit)
{
    base.createCreep([Game.MOVE, Game.WORK, Game.MOVE, Game.CARRY], Math.random(), {role:'builder'});
}
else
{
    var sum = healercount + guardcount + rangercount;

    // Spawn healer
    if (healercount/sum < healerprop)
    {
        base.createCreep([Game.MOVE, Game.HEAL, Game.HEAL, Game.MOVE, Game.TOUGH], Math.random(), {role:'healer'});
    }
    
    // Spawn ranger
    else if (rangercount/sum < rangerprop)
    {
        base.createCreep([Game.RANGED_ATTACK, Game.RANGED_ATTACK, Game.RANGED_ATTACK, Game.RANGED_ATTACK, Game.MOVE, Game.TOUGH, Game.TOUGH, Game.TOUGH, Game.TOUGH], Math.random(), {role:'ranger'});
    }
    
    // Spawn guards
    else
    {
        base.createCreep([Game.ATTACK, Game.ATTACK, Game.ATTACK, Game.ATTACK, Game.TOUGH, Game.TOUGH, Game.TOUGH, Game.MOVE, Game.TOUGH], Math.random(), {role:'guard'});
    }
}