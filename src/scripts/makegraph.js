import * as d3 from "d3";
import convertPageReferenceToLabel from "../components/editor_utils/convertPageReferenceToLabel";

export default function loadGraph(nodesData, linksData, viewNote, graphContainer) {
	if (process.browser) {
		window.centerForce = 0.5;
		window.forceManyBodyStrength = -300;
		window.linkDistance = 70;
	}
	const element = document.createElementNS("http://www.w3.org/2000/svg", "svg");

	element.setAttribute("id", "graph-svg");
	element.setAttribute("width", graphContainer.clientWidth);
	element.setAttribute("height", graphContainer.clientHeight);
	graphContainer.appendChild(element);

	var svg = d3.select("#graph-svg"),
		width = +svg.attr("width"),
		height = +svg.attr("height");

	let simulation = d3
		.forceSimulation(nodesData, true)
		.force("charge", d3.forceManyBody().strength(window.forceManyBodyStrength))
		.force("center", d3.forceCenter(width * window.centerForce, height * window.centerForce))
		.force(
			"link",
			d3
				.forceLink()
				.distance(window.linkDistance)
				.links(linksData)
				.id((d) => d.id)
		)
		.stop();

	let g = svg.append("g");

	function nodeClick(d) {
		viewNote(d.id);
	}

	var link = g
		.append("g")
		.attr("class", "links")
		.selectAll("line")
		.data(linksData)
		.enter()
		.append("line")
		.attr("stroke-width", (d) => Math.sqrt(d.value));

	var node = g
		.append("g")
		.attr("class", "nodes")
		.selectAll("circle")
		.data(nodesData)
		.enter()
		.append("circle")
		.attr("r", 7)
		.attr("id", (d) => "node-" + d.id)
		.call(d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended))
		.on("click", (d) => {
			nodeClick(d);
		})
		.on("mouseover", (d) => {
			document.querySelector("#label-" + d.id).classList.add("mouseover");
		})
		.on("mouseout", (d) => {
			document.querySelector("#label-" + d.id).classList.remove("mouseover");
		});

	var label = g
		.append("g")
		.attr("class", "labels")
		.selectAll("text")
		.data(nodesData)
		.enter()
		.append("text")
		.attr("id", (d) => "label-" + d.id)
		.call(d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended))
		.on("click", (d) => {
			nodeClick(d);
		})
		.on("mouseover", (d) => {
			document.querySelector("#node-" + d.id).classList.add("mouseover");
		})
		.on("mouseout", (d) => {
			document.querySelector("#node-" + d.id).classList.remove("mouseover");
		})
		.on("drag", function (d) {
			document.querySelector("#node-" + d.id).classList.add("drag");
		})
		.on("dragend", function (d) {
			document.querySelector("#node-" + d.id).classList.remove("drag");
		})
		.text((d) => convertPageReferenceToLabel(d.content));

	svg.call(
		d3
			.zoom()
			.scaleExtent([1 / 2, 8])
			.on("zoom", zoomed)
	);

	function zoomed() {
		g.attr("transform", d3.event.transform);
	}

	function ticked() {
		simulation.tick();
		link.attr("x1", (d) => d.source.x)
			.attr("y1", (d) => d.source.y)
			.attr("x2", (d) => d.target.x)
			.attr("y2", (d) => d.target.y);

		node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);

		label.attr("x", (d) => d.x - 15).attr("y", (d) => d.y - 15);
	}

	let itvl = setInterval(ticked, 25);

	function dragstarted(d) {
		if (!d3.event.active) simulation.alphaTarget(0.3).restart();
		d.fx = d.x;
		d.fy = d.y;
	}

	function dragged(d) {
		d.x = d3.event.x;
		d.y = d3.event.y;
		d.fx = d.x;
		d.fy = d.y;
	}

	function dragended(d) {
		if (!d3.event.active) simulation.alphaTarget(0);
		d.fx = null;
		d.fy = null;
	}

	window.d3 = d3;
	window.d3g = g;

	return {
		remove: () => {
			simulation.stop();
			link.exit();
			g.selectAll("line").remove();

			node.exit();
			g.selectAll("circle").remove();

			label.exit();
			g.selectAll("text").remove();

			g.exit();
			g.remove();

			svg.exit();
			svg.remove();

			g = null;

			simulation.force("charge", null);
			simulation.force("center", null);
			simulation.force("link", null);
			clearInterval(itvl);
			simulation = null;
		},
	};
}
