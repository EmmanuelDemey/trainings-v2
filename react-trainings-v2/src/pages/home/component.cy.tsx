import Home from './component';

describe('<Home />', () => {
	it('renders', () => {
		// see: https://on.cypress.io/mounting-react
		cy.mount(<Home />);
	});
});
