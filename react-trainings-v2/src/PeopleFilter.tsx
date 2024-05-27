type PeopleFilterType = { handleChange: (v: string) => void };

const PeopleFilter = ({ handleChange }: PeopleFilterType) => (
	<div className="field">
		<div className="control">
			<input
				className="input is-info"
				type="text"
				onChange={(e) => handleChange(e.target.value)}
			/>
		</div>
	</div>
);

export default PeopleFilter;
