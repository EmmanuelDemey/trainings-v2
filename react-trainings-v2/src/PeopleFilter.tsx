type PeopleFilterType = { value: string; handleChange: (v: string) => void };

const PeopleFilter = ({ value, handleChange }: PeopleFilterType) => (
	<div className="field">
		<div className="control">
			<input
				className="input is-info"
				type="text"
				onChange={(e) => handleChange(e.target.value)}
				value={value}
			/>
		</div>
	</div>
);

export default PeopleFilter;
