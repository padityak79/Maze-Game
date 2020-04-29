const {Engine, Render, Runner, World, Bodies, Body, Events}= Matter;

const engine= Engine.create();
const {world} = engine;
world.gravity.y= 0;
const cellsHorizontal= 7;
const cellsVertical= 5;
const width= window.innerWidth;
const height= window.innerHeight;
const unitLengthX = width / cellsHorizontal;
const unitLengthY = height / cellsVertical;

const render= Render.create({
    element: document.body,
    engine: engine,
    options:{
        wireframes: false,
        width,
        height
    }
});
Render.run(render);
Runner.run(Runner.create(),engine);

//Walls

const Walls= [
    Bodies.rectangle(width/2,0,width,2,{ isStatic: true}),
    Bodies.rectangle(width/2,height,width,2,{ isStatic: true}),
    Bodies.rectangle(0,height/2,2,height,{ isStatic: true}),
    Bodies.rectangle(width,height/2,2,height,{ isStatic: true}),
];

World.add(world, Walls);
const shuffle = (arr)=>{
    let counter= arr.length;

    while(counter>0){
        index= Math.floor(Math.random()*counter);
        counter--;
        const temp= arr[index];
        arr[index]=arr[counter];
        arr[counter]= temp;
    }
    return arr;
}

//Maze Generation

const grid= Array(cellsVertical)
            .fill(null)
            .map(()=> Array(cellsHorizontal).fill(false));

const verticals= Array(cellsVertical)
               .fill(null)
               .map(()=> Array(cellsHorizontal - 1).fill(false));

const horizontals= Array(cellsVertical-1)
                  .fill(null)
                  .map(()=> Array(cellsHorizontal).fill(false));
   
const createMaze= (row,column)=>{
    if(grid[row][column]) return;

    grid[row][column] = true;

    const neighbors = shuffle([
        [row-1, column, 'up'],
        [row+1, column, 'down'],
        [row, column-1, 'left'],
        [row, column+1, 'right']
    ]) ;
    for(neighbor of neighbors){
        const [nextRow, nextColumn, direction] = neighbor;
        if(nextRow<0 || nextRow == cellsVertical|| nextColumn == cellsHorizontal|| nextColumn<0) continue;

        if(grid[nextRow][nextColumn]) continue;

        if(direction=== 'left') verticals[row][column-1] = true;
        else if(direction=== 'right') verticals[row][column] = true;
        else if(direction=== 'up') horizontals[row-1][column] = true;
        else if(direction=== 'down') horizontals[row][column] = true;

        createMaze(nextRow,nextColumn);
    }
}

createMaze( Math.floor(Math.random()*cellsVertical), Math.floor(Math.random()*cellsHorizontal) );

//drawing Walls

horizontals.forEach((rows,rowIndex)=>{
    rows.forEach((open,columnIndex)=>{
        if(open) return;

        const walls= Bodies.rectangle(
            columnIndex*unitLengthX+ unitLengthX/2, (rowIndex+1)*unitLengthY, unitLengthX, 5,{
                label: 'wall',
                isStatic: true,
                render: {
                    fillStyle: 'red'
                }
            }
        );
        World.add(world, walls);
    });
});

verticals.forEach((row,rowIndex)=>{
    row.forEach((open,columnIndex)=>{
        if(open) return;

        const walls= Bodies.rectangle((columnIndex+1)*unitLengthX, unitLengthY*(rowIndex+0.5), 5, unitLengthY, {
            label: 'wall',
            isStatic: true,
            render: {
                fillStyle: 'red'
            }

        });
    World.add(world, walls);
    });
});
const goal= Bodies.rectangle(width- unitLengthX/2, height - unitLengthY/2, unitLengthX*0.8, unitLengthY*0.8, {
    isStatic: true,
    label: 'goal',
    render: {
        fillStyle: 'blue'
    }
});

World.add(world, goal);

//ball
const ballRadius= Math.min(unitLengthX,unitLengthY)/4;
const ball= Bodies.circle(
    unitLengthX/2,
    unitLengthY/2,
    ballRadius,
    {
        label: 'ball',
        render: {
            fillStyle: 'green'
        }
    }
);

World.add(world, ball);

document.addEventListener('keydown', (event)=>{
    const {x,y} = ball.velocity;
    if(event.keyCode=== 87)     Body.setVelocity(ball, {x, y: y-5});
    if(event.keyCode=== 68)     Body.setVelocity(ball, {x: x+5, y});
    if(event.keyCode=== 83)     Body.setVelocity(ball, {x, y: y+5});
    if(event.keyCode=== 65)     Body.setVelocity(ball, {x: x-5, y});
});
//win condition

Events.on(engine, 'collisionStart', event=>{
        event.pairs.forEach( collision=> {
        const labels= ['ball', 'goal'];

        if(labels.includes(collision.bodyA.label) && labels.includes(collision.bodyB.label)){
            document.querySelector('.winner').classList.remove('hidden');
            world.gravity.y= 1;
            world.bodies.forEach(body=> {
                if(body.label === 'wall'){
                    Body.setStatic(body, false);
                }
            });
        }
    });
});