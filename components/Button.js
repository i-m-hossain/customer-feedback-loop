export default function (props) {
    return <button {...props} className={`border rounded px-4 py-2 hover:bg-orange-400 border-orange-400 flex gap-2 items-center justify-center }`}>{props.children}</button>
}