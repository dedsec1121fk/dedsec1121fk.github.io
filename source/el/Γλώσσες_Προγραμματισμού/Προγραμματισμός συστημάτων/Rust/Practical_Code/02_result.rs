use std::num::ParseIntError;
fn double(raw: &str) -> Result<i32, ParseIntError> {
    let value: i32 = raw.parse()?;
    Ok(value * 2)
}
fn main() {
    println!("{:?}", double("21"));
    println!("{:?}", double("oops"));
}
