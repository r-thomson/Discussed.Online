import resolveConfig from 'tailwindcss/resolveConfig.js';
import tailwindConfig from '../tailwind.config.js';

const resolvedConfig = resolveConfig(tailwindConfig);

export default resolvedConfig.theme;
