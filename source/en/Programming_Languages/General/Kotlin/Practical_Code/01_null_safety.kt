fun main() {
    val name: String? = null
    println(name?.uppercase() ?: "Unknown")
    val scores = listOf(2, 4, 8)
    println(scores.sum())
}
