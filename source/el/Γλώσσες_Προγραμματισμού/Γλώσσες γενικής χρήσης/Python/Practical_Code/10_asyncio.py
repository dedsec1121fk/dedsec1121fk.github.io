import asyncio

async def worker(name: str) -> str:
    await asyncio.sleep(0.01)
    return "finished: " + name

async def main():
    print(await asyncio.gather(worker("alpha"), worker("beta")))

if __name__ == "__main__":
    asyncio.run(main())
