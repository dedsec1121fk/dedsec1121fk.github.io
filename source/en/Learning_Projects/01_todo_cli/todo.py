#!/usr/bin/env python3
"""Offline to-do tracker. Usage: python todo.py --db mytasks.json add "Read Python"""
import argparse, json, os
from pathlib import Path

def read_tasks(path):
    if not path.is_file(): return []
    data=json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(data,list):raise ValueError('database must be a list')
    return data

def save_tasks(path,tasks):
    path.parent.mkdir(parents=True,exist_ok=True)
    temp=path.with_name(path.name+'.tmp')
    try:
        temp.write_text(json.dumps(tasks,ensure_ascii=False,indent=2),encoding='utf-8')
        temp.replace(path)
    finally:
        if temp.exists():temp.unlink()

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument('--db',type=Path,default=Path('tasks.json'))
    sub=ap.add_subparsers(dest='action',required=True)
    add=sub.add_parser('add');add.add_argument('title')
    sub.add_parser('list')
    done=sub.add_parser('done');done.add_argument('id',type=int)
    args=ap.parse_args()
    tasks=read_tasks(args.db)
    if args.action=='add':
        if not args.title.strip():ap.error('empty task')
        tasks.append({'id':max((x['id'] for x in tasks),default=0)+1,'title':args.title,'done':False})
        save_tasks(args.db,tasks)
    elif args.action=='done':
        target=next((x for x in tasks if x['id']==args.id),None)
        if target is None:ap.error('task id not found')
        target['done']=True;save_tasks(args.db,tasks)
    for row in tasks:print(f"{row['id']:>3} [{'x' if row['done'] else ' '}] {row['title']}")
if __name__=='__main__':main()
