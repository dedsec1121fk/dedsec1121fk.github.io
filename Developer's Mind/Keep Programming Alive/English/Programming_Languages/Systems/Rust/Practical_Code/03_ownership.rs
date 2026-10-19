fn length(text: &str) -> usize { text.len() }
fn main() {
    let message = String::from("hello");
    println!("length: {}", length(&message));
    println!("still owned: {}", message);
}
