var num_of_cols = 4;
var num_of_rows = 3;
var timeout_ms = 2500;

//Construct the deck of cards
colors = ["red", "green", "darkviolet"];
nums = [1, 2, 3];
textures = ["solid", "stripe", "blank"];
shapes = ["oval", "squiggle", "diamond"];
var card = {};
var cards = [];
var nextCard = 0;
var setCount = 0;
var missCount = 0;

 $.each(nums, function(iNum,thisNum) {
	$.each(colors, function(iColor, thisColor){
		$.each(textures, function(iTexture, thisTexture){
			$.each(shapes, function(iShape, thisShape){
				card = { num : thisNum, color : thisColor, texture : thisTexture, shape : thisShape};
				cards.push(card); 
			})
		})
	})
 })

$(document).ready(function(){
	// Expand jQuery with some selectors to help our goal
	$.expr[":"].mod = function(el, i, m) {
		return i % m[3] === 0
	};  
	$.expr[":"].sub_mod = function(el, i, m) {
		var params = m[3].split(",");
		return (i-params[0]) % params[1] === 0
	};  
	initGame();

});

function drawCard(can, card){
	var pad = 8;
	var cellW = parseInt($("#game_map .cell").css("width"), 10);
	var cellH = parseInt($("#game_map .cell").css("height"), 10);
	
	var symW = cellW - 2 * pad;
	var symH = Math.floor((cellH - 4 * pad) / 3);
	var c    = Math.round(cellH / 2);

	ctx = can.getContext("2d");
	ctx.fillStyle = card.color;
	ctx.strokeStyle = card.color;
	ctx.lineWidth = 2;
	ctx.lineJoin = "round";

	ctx.clearRect(0, 0, cellW, cellH);
	
	if(card==0){
		return false;
	}
	
	if(card.num==1){
		positions = [c - symH/2];
	}
	else if(card.num==2){
		positions = [c - symH - pad/2, c + pad/2];
	}
	else{
		positions = [c - 3*symH/2 - pad, c - symH/2, c + symH/2 + pad];
	}

	$.each(positions, function(iPos, pos){
		if(card.texture=="solid"){
			traceShape(pos, card.shape);
			ctx.fill();
		}
		else if(card.texture=="stripe"){
			ctx.globalAlpha = 0.8;
			traceShape(pos, card.shape);
			ctx.fill();
			drawStripes(pos);
			ctx.globalAlpha = 1;
			traceShape(pos, card.shape);
			ctx.stroke();
		}
		else if(card.texture=="blank"){
			traceShape(pos, card.shape);
			ctx.stroke();
		}
	})
	
	function traceShape(pos, shape){
		if(shape=="oval"){
			traceOval(pos);
		}
		else if(shape=="diamond"){
			traceDiamond(pos);
		}
		else if(shape=="squiggle"){			
			traceSquiggle(pos);			
		}
	}
	
	function traceOval(pos){
		ctx.beginPath();
		ctx.arc(pad + symW - symH/2, pos + symH/2, symH/2, Math.PI/2, 3*Math.PI/2, true);
		ctx.moveTo(pad + symW - symH/2, pos + symH);
		ctx.lineTo(pad + symH/2, pos + symH);
		ctx.arc(pad + symH/2, pos + symH/2, symH/2, Math.PI/2, 3*Math.PI/2, false);
		ctx.lineTo(pad + symW - symH/2, pos);
		
	}
	
	function traceSquiggle(pos){
		var extreme = 2;
		ctx.beginPath()
		ctx.moveTo(pad + pad, pos + symH/4);
		ctx.bezierCurveTo(	pad + symW/3  , pos  + symH * (1 - extreme) / 4,
							pad + symW*2/3, pos  + symH * (1 + extreme) / 4,
							pad + symW-pad, pos + symH/4);
		ctx.bezierCurveTo(	pad + symW, 	pos + symH * (1 - extreme/3) / 4,
							pad + symW, 	pos + symH * (1 + extreme/3) / 4,
							pad + symW-pad, pos + 3*symH/4);
		ctx.bezierCurveTo(	pad + symW*2/3, pos  + symH * (3 + extreme) / 4,
							pad + symW/3, 	pos  + symH * (3 - extreme) / 4,
							pad + pad, 		pos + 3*symH/4);
		ctx.bezierCurveTo(	pad, 			pos + symH * (3 + extreme/3) / 4,
							pad, 			pos + symH * (3 - extreme/3) / 4,
							pad + pad, pos + symH/4);				
		
	}
	
	function traceDiamond(pos){
		ctx.beginPath();
		ctx.moveTo(pad, pos + symH/2);
		ctx.lineTo(pad + symW/2, pos);
		ctx.lineTo(pad + symW, pos + symH/2);
		ctx.lineTo(pad + symW/2, pos + symH);
		ctx.lineTo(pad, pos + symH/2);
	}
	
	function drawStripes(pos){
		var stripeW = 2;
		for(var left=0; left<cellW; left=left+2*stripeW){
			ctx.clearRect(left, pos, stripeW, pos+symH);
		}
	}
	
}

function dealCards(dealingThreeMore){
	var toFill = $("#game_map .cardCanvas.emptySlot");
	
	var allSlots = $("#game_map .cardCanvas");
	//If there are at least 12 cards on the board...
	if(!dealingThreeMore && (allSlots.length - toFill.length >= 12)){
		
		// find all cells to remove
		var lastColCells = $(".rowend").prev(); 
		// find the canvases with cards we need to move
		var lastColCans = lastColCells.find(".cardCanvas").not(".emptySlot");
		
		var cardsToStore = [];
		$.each(lastColCans, function(iCan, can){
			if($.hasData(can)){
				var thisCard = $.data(can, "whichCard");
				if(thisCard != 0){
					cardsToStore.push(thisCard);
				}
			}
		})
		//get rid of those cells
		lastColCells.remove();
		//find remaining empty slots
		toFill = $("#game_map .cardCanvas.emptySlot");
		//place stored cards in empty slots 
		$.each(toFill, function(iCan, can){
			drawCard(can, cardsToStore[iCan]);
			$.data(can, "whichCard", cardsToStore[iCan]);
		})
		toFill.removeClass("emptySlot");
	}
	else{
		if(nextCard + toFill.length > cards.length){ // Out of cards!
			// Deal blank cards instead
			$.each(toFill, function(iCan, can){
				drawCard(can, 0);
				$.data(can, "whichCard", 0);
			})
			// Show total and restart button
			endGame();
		}
		else{ // Still have cards to deal
			//In each canvas, draw new card and store ID
			$.each(toFill, function(iCan, can){
				drawCard(can, cards[nextCard]);
				$.data(can, "whichCard", cards[nextCard]);
				++nextCard;
			})
		}
		toFill.removeClass("emptySlot");
		
		// If no further dealing possible, switch to restart button
		if(nextCard + 3 > cards.length){
			endGame();
		}
	}
	
	var gameW = $("#game_map").width();
	$(".match_game_width").css("width", gameW);
	
	var containerWidth = $('body').width();
	var offsetLeft = (containerWidth - gameW)/2;
	//Alter the CSS properties of the container with its new padding and dimensions.
	$('.container').css({'padding-left': offsetLeft, 'width': containerWidth - offsetLeft});
	
}

function initGame(){

	// Shuffle the cards and start with the top one.
	cards = $.shuffle(cards);
	nextCard = setCount = missCount = 0;

	$("#game_map").empty();
	for(var i=0; i<num_of_cols*num_of_rows; ++i)
	{
		var cell = $("<div></div>")
					.addClass("cell")
					.appendTo("#game_map");
		// Add the line breaks
		if ( i % num_of_cols == 0 && i > 0){
			cell.before('<div class="clear rowend"></div>');
		}
	}
	cell.after('<div class="clear rowend"></div>');
	
	$("<canvas></canvas>")
		.addClass("cardCanvas")
		.addClass("emptySlot")
		.appendTo("#game_map .cell");
	$("#game_map .emptySlot").empty();
	

	$("#game_map .cell")
		.bind("click", playMove)
		.bind('mouseover', hoverCell)
		.bind('mouseout', leaveCell);
	dealCards();
	
	$("#three_more")
		.bind("click", threeMore);
		
	$("#restart")
		.bind("click", restartGame);
		
	$('#hint').bind("click", hintFunction);
	
};

function threeMore(){
	var rowEnds = $(".rowend");
	
	$("<div></div>")
		.addClass("cell")
		.addClass("extraCard")
		.appendTo("#game_map")
		.bind("click", playMove)
		.bind('mouseover', hoverCell)
		.bind('mouseout', leaveCell)
		.insertBefore(rowEnds);
	
	$("<canvas></canvas>")
		.addClass("cardCanvas")
		.addClass("emptySlot")
		.appendTo("#game_map .extraCard");
	$("#game_map .emptySlot").empty();
	$("#game_map .cell").removeClass("extraCard");
	dealCards(true);
}

function hintFunction() {

	// First find anything currently selected and un-select it
	
	$("#game_map .marked > .cardCanvas").parent().toggleClass('marked');

	dealtCards = $('.cardCanvas');
	hintCards = new Array();
	for (i = 0; i < dealtCards.length; i++) {
		hintCards[i] = i;
	}
	hintCards = $.shuffle(hintCards);
	for (iHint=0; iHint<dealtCards.length; iHint++) {
		i = hintCards[iHint];
		for (j=(i+1); j<dealtCards.length; j++) {
			for (k=(j+1); k<dealtCards.length; k++) {
				if (isSet([	$.data(dealtCards[i], 'whichCard'), 
							$.data(dealtCards[j], 'whichCard'), 
							$.data(dealtCards[k], 'whichCard')])) {
					playMove(i);
					return;
				}
			}
		}
	}
	
	// If no set is available on the board...
	threeMore();

}

function isSet(cards){
	if(cards.length==3) {
		var colorComps = [	cards[0].color == cards[1].color,
							cards[0].color == cards[2].color,
							cards[1].color == cards[2].color];
		var numComps   = [  cards[0].num == cards[1].num,
							cards[0].num == cards[2].num,
							cards[1].num == cards[2].num];
		var texComps   = [	cards[0].texture == cards[1].texture,
							cards[0].texture == cards[2].texture,
							cards[1].texture == cards[2].texture];
		var shapeComps = [	cards[0].shape == cards[1].shape,
							cards[0].shape == cards[2].shape,
							cards[1].shape == cards[2].shape];
		if((all(colorComps) || !any(colorComps)) &&
		   (all(numComps)   || !any(numComps)) &&
		   (all(texComps)   || !any(texComps)) &&
		   (all(shapeComps) || !any(shapeComps))){
		   return true;
		   }
	}
	return false;
}

function disableGame(ev){
	$("#game_map .cell > canvas").addClass("disabled");
	$("#notaset").removeClass("timeout"); //todo: this is bad style
	$("#game_map .cell")
		.unbind("click")
		.unbind("mouseover")
		.unbind("mouseout");
};

function enableGame(ev){
	$("#game_map .cell > canvas").removeClass("disabled");
	$("#notaset").addClass("timeout");
	$("#game_map .cell")
		.bind("click", playMove)
		.bind('mouseover', hoverCell)
		.bind('mouseout', leaveCell);
}

function restartGame(ev){
	ev.preventDefault();
	$("#three_more").removeAttr("disabled");
	$("#three_more").text("Three more!");
	$(".end_game").hide();
	$('#three_more').unbind();
	$('#restart').unbind();
	$('#hint').unbind();
	initGame();
}

function endGame(){
	$("#three_more").attr("disabled", "disabled");
	$("#three_more").text("No more cards!");
	$(".end_game").show();
}

function playMove(ev){
	
	var cell = $(this);
	
	if(parseInt(ev, 10) >= 0) {
		cell = $($('.cell')[ev]);
	}

	cell
		.toggleClass("marked")
		.trigger("mouseout");
	
	chosen = $("#game_map .marked > .cardCanvas");
	if(chosen.length==3){
		
		var putativeSet = [];
		for(var i=0; i<3; ++i){
			putativeSet.push($.data(chosen[i], "whichCard"));
		}
		if(isSet(putativeSet)){
			chosen.addClass("emptySlot");
			dealCards();
			++setCount;
			}
		else{
			disableGame();
			setTimeout(enableGame, timeout_ms);
			++missCount;
		}
			
		$("#set_count").text(setCount);
		$("#miss_count").text(missCount);
		$("#game_map .cell.marked").removeClass("marked");
	}
};


function hoverCell(ev){
	$(this).addClass("hover");
	return false;
};
function leaveCell(ev){
	$(this).removeClass("hover");
	return false;
};

///////UTILITIES

function all(arr){
	for(var i=0; i<arr.length; ++i){
		if(!arr[i]){return false}}
	return true;
}
function any(arr){
	for(var i=0; i<arr.length; ++i){
		if(arr[i]){return true;}}
	return false;
}
