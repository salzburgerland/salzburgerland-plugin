<meta name="viewport" content="width=device-width; initial-scale=1; minimal-ui">

<div id="wheel-main">

	<!-- Nav tabs -->
	<ul class="nav nav-tabs" role="tablist">
		<li id="select-date-tab" role="presentation" class="active"><a href="#select-date" role="tab" data-toggle="tab">Select
				date</a></li>
		<li id="select-interest-tab" role="presentation"><a href="#select-interest" role="tab" data-toggle="tab">Select
				interest</a></li>
	</ul>

	<!-- Tab panes -->
	<div class="tab-content">

		<!-- Select interest tab -->
		<div role="tabpanel" class="tab-pane" id="select-interest">
			<div class="current-choice">

				<label>I'm interested in:</label>
				<input id="interest-input" name="interests[]" readonly/>

			</div>
		</div>

		<!-- Select date tab -->
		<div role="tabpanel" class="tab-pane active" id="select-date">
			<div class="current-choice">
				<div class="arriving">
					<label>Arriving:</label>
					<input id="date-from-input" name="date-from" readonly/>
				</div>
				<div class="departing">
					<label>Departing:</label>
					<input id="date-to-input" name="date-to" readonly/>
				</div>
			</div>
		</div>

	</div>

	<div class="wheel-container">
		<!-- this svg will contain thw wheel and will expand to the size of the parent div -->
		<svg id="wheel"></svg>

		<button class="btn-lg" id="wheel-submit">Choose period and interests</button>
	</div>

</div>
