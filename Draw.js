let canvas = document.getElementById("canvas");
let ctx = canvas.getContext('2d');
let cameraOffset = { x: window.innerWidth/2, y: window.innerHeight/2 };
let cameraZoom = 1;
let MAX_ZOOM = 5;
let MIN_ZOOM = 0.1;
let SCROLL_SENSITIVITY = 0.0005;
let initialPinchDistance = null;
let lastZoom = cameraZoom;
let isDragging = false;
let dragStart = { x: 0, y: 0 };
let characterList = [];

function draw() {
	prepareCanvas();
	ctx.clearRect(0,0, window.innerWidth, window.innerHeight);
	drawText("",0,0,20,"arial");
	for(var i = 0; i < characterList.length; i++)
		drawCharacterCard(characterList[i][0],characterList[i][1],characterList[i][2],characterList[i][3], characterList[i][4].trim());
	requestAnimationFrame( draw );
}

function prepareCanvas() {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	ctx.translate( window.innerWidth / 2, window.innerHeight / 2 );
	ctx.scale(cameraZoom, cameraZoom);
	ctx.translate( -window.innerWidth / 2 + cameraOffset.x, -window.innerHeight / 2 + cameraOffset.y );
}

function getEventLocation(e) {
	if (e.touches && e.touches.length == 1)
		return { x:e.touches[0].clientX, y: e.touches[0].clientY };
	else if (e.clientX && e.clientY)
		return { x: e.clientX, y: e.clientY };
}

function drawRect(x, y, width, height) {
	ctx.fillRect( x, y, width, height );
}

function drawText(text, x, y, size, font) {
	ctx.font = `${size}px ${font}`;
	ctx.fillText(text, x, y);
}

function drawCharacterCard(x,y,gender,img_src = "",name = "") {
	var img = new Image();

	if(gender == "M"){
		ctx.strokeStyle = "blue";
		ctx.fillStyle = "#b7e2fc";
		img.src = "images/male.png";
	}
	else {
		ctx.strokeStyle = "#e9658d";
		ctx.fillStyle = "#ffe6ee";
		img.src = "images/female.png";
	}

	if (img_src != "")
		img.src = img_src;

	ctx.beginPath();
	ctx.roundRect(x, y, 150, 200, [25]);
	ctx.fill();
	ctx.drawImage(img, x + 25, y + 10, 100, 100);			
	ctx.fillStyle = "white";
	drawText(name.split("\n",2)[0],x+(75 - ctx.measureText(name.split("\n",2)[0]).width/2),y+150,20,"arial");
	drawText(name.split("\n",2)[1],x+(75 - ctx.measureText(name.split("\n",2)[1]).width/2),y+180,20,"arial");
	ctx.stroke();
}

function prepareCharacterList(root) {
	prepareCanvas();
	let ans = [];
	let main_queue=[];
	main_queue.push(root);
	let temp=[];
	while (main_queue.length) {
		let n = main_queue.length;
		for (let i = 0; i < n; i++) {
			let cur = main_queue.shift();
			temp.push(cur);
			for (let u of cur.child_members)
				main_queue.push(u);
		}
		ans.push(temp);
		temp=[];
	}
	let level = 0;
	for (let v of ans) {
		let sib = v.length;
		let dist = 0;
		let fact = 1;
		for (let x of v){
			dist += 0.5;
			characterList.push([fact * parseInt(dist) * (canvas.width/sib) - 75,-canvas.height/2 + 25 + level*250,x.gender,"",x.first_name + "\n" + x.last_name]);
			fact *= -1;
		}
		level += 1;
	}
}

function centerCanvas() {
	cameraOffset = { x: window.innerWidth/2, y: window.innerHeight/2 };
}

function onPointerDown(e) {
	isDragging = true;
	dragStart.x = getEventLocation(e).x/cameraZoom - cameraOffset.x;
	dragStart.y = getEventLocation(e).y/cameraZoom - cameraOffset.y;
}

function onPointerUp(e) {
	isDragging = false;
	initialPinchDistance = null;
	lastZoom = cameraZoom;
}

function onPointerMove(e) {
	if (isDragging) {
		cameraOffset.x = getEventLocation(e).x/cameraZoom - dragStart.x;
		cameraOffset.y = getEventLocation(e).y/cameraZoom - dragStart.y;
	}
}

function handleTouch(e, singleTouchHandler)
{
	if ( e.touches.length == 1 )
		singleTouchHandler(e);
	else if (e.type == "touchmove" && e.touches.length == 2) {
		isDragging = false;
		handlePinch(e);
	}
}

function handlePinch(e)
{
	e.preventDefault();
	let touch1 = { x: e.touches[0].clientX, y: e.touches[0].clientY };
	let touch2 = { x: e.touches[1].clientX, y: e.touches[1].clientY };
	let currentDistance = (touch1.x - touch2.x)**2 + (touch1.y - touch2.y)**2;

	if (initialPinchDistance == null)
		initialPinchDistance = currentDistance;
	else
		adjustZoom( null, currentDistance/initialPinchDistance );
}

function adjustZoom(zoomAmount, zoomFactor)
{
	if (!isDragging) {
		if (zoomAmount)
			cameraZoom += zoomAmount;
		else if (zoomFactor) {
			cameraZoom = zoomFactor*lastZoom;
		}
		cameraZoom = Math.min( cameraZoom, MAX_ZOOM );
		cameraZoom = Math.max( cameraZoom, MIN_ZOOM );
	}
}

canvas.addEventListener('mousedown', onPointerDown);
canvas.addEventListener('touchstart', (e) => handleTouch(e, onPointerDown));
canvas.addEventListener('mouseup', onPointerUp);
canvas.addEventListener('touchend',  (e) => handleTouch(e, onPointerUp));
canvas.addEventListener('mousemove', onPointerMove);
canvas.addEventListener('touchmove', (e) => handleTouch(e, onPointerMove));
canvas.addEventListener( 'wheel', (e) => adjustZoom(-e.deltaY*SCROLL_SENSITIVITY));