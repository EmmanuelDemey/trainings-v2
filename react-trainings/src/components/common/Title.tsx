import { Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

type TitleProps = {
	text: string;
	level?: 1 | 2 | 3 | 4;
};

const Title = ({ text, level = 1 }: TitleProps) => {
	const theme = useTheme();
	return (
		<Typography
			variant={`h${level}`}
			style={{
				color: theme.palette.text.primary,
				textAlign: 'center',
				marginBottom: '20px',
			}}
		>
			{text}
		</Typography>
	);
};

export default Title;
