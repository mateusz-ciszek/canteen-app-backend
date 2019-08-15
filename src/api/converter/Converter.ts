export interface Converter<INPUT, OUTPUT> {
	convert(input: INPUT): OUTPUT;
}