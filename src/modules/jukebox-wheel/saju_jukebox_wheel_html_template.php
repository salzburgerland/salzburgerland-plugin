<meta name="viewport" content="width=device-width; initial-scale=1; minimal-ui">

<div id="wheel-main">

	<!-- Nav tabs -->
	<ul class="nav nav-tabs" role="tablist" class="selector__tabs">
		<li id="select-date-tab" role="presentation" class="active selector__tabs__tab selector__tabs__tab--dates"><a
				href="#select-date" role="tab" data-toggle="tab">Dates</a></li>
		<li id="select-interest-tab" role="presentation" class="selector__tabs__tab selector__tabs__tab--interests"><a
				href="#select-interest" role="tab" data-toggle="tab">Interests</a></li>
	</ul>

	<!-- Tab panes -->
	<div class="tab-content">

		<!-- Select interest tab -->
		<div role="tabpanel" class="tab-pane selector__interests" id="select-interest">
			<div class="current-choice">

				<label>I'm interested in:</label>
				<input id="interest-input" name="interests[]" readonly/>

			</div>

			<div class="wheel-container">
				<!-- this svg will contain thw wheel and will expand to the size of the parent div -->
				<svg id="wheel--interests"></svg>

			</div>

		</div>

		<!-- Select date tab -->
		<div role="tabpanel" class="tab-pane active selector__dates" id="select-date">
			<div class="current-choice">
				<div class="arriving selector__dates__date selector__dates__date--arriving">
					<label>Arriving:</label>
					<input id="date-from-input-nice" readonly />
                                        <input id="date-from-input" name="date-from" type="hidden" />
				</div>
				<div class="departing selector__dates__date selector__dates__date--departing">
					<label>Departing:</label>
					<input id="date-to-input-nice" readonly />
                                        <input id="date-to-input" name="date-to" type="hidden" />
				</div>
			</div>

			<div class="wheel-container">
				<!-- this svg will contain thw wheel and will expand to the size of the parent div -->
				<svg id="wheel--dates"></svg>

			</div>

		</div>

	</div>


	<button class="btn-lg" id="wheel-submit">Find Now</button>

</div>
