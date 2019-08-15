export interface ExtendedConverter<INPUT, OUTPUT, EXTRA = any> {
	convert(input: INPUT, extra: EXTRA): OUTPUT;
}