fn find_even(values: &[i32]) -> Option<i32> {
    values.iter().copied().find(|value| value % 2 == 0)
}
fn main() {
    println!("{:?}", find_even(&[3, 5, 8]));
}
