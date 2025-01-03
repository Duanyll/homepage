import classNames from "classnames";
import prettyBytes from "pretty-bytes";

export function NodeDetail({ name, online, runningVmCount, totalVmCount, memoryUsedBytes, memoryTotalBytes, cpuUsage }) {
  const statusColor = online ? "bg-green-500" : "bg-red-500";
  const memUsedPercent = Math.round(memoryUsedBytes / memoryTotalBytes * 100);
  const cpuUsedPercent = Math.round(cpuUsage * 100);

  return (
    <div className="flex flex-row text-theme-700 dark:text-theme-200 items-center text-xs relative h-5 w-full rounded-md bg-theme-200/50 dark:bg-theme-900/20 mt-1">
      <div
        className="absolute h-5 rounded-md bg-theme-200 dark:bg-theme-900/40 z-0"
        style={{
          width: `${memUsedPercent}%`,
        }}
      />
      <span className="ml-2 h-2 w-2 z-10">
        <span className={classNames("block w-2 h-2 rounded", statusColor)} />
      </span>
      <div className="text-xs z-10 self-center ml-2 relative h-4 grow mr-2">
        <div className="absolute w-full whitespace-nowrap text-ellipsis overflow-hidden text-left">
          {name} ({runningVmCount} / {totalVmCount})
        </div>
      </div>
      <div className="self-center text-xs flex justify-end mr-1.5 pl-1 z-10 text-ellipsis overflow-hidden whitespace-nowrap">
        <span>
          {prettyBytes(memoryUsedBytes)} / {prettyBytes(memoryTotalBytes)}
        </span>
        <span className="pl-2">({cpuUsedPercent}%)</span>
      </div>
    </div>
  );
}

export function VmDetail({ name, running, cpuUsage, memoryUsedBytes, memoryTotalBytes }) {
  const statusColor = running ? "bg-green-500" : "bg-red-500";
  const memUsedPercent = Math.round(memoryUsedBytes / memoryTotalBytes * 100);
  const cpuUsedPercent = Math.round(cpuUsage * 100);

  return (
    <div className="flex flex-row text-theme-700 dark:text-theme-200 items-center text-xs relative h-5 w-full rounded-md bg-theme-200/50 dark:bg-theme-900/20 mt-1">
      <div
        className="absolute h-5 rounded-md bg-theme-200 dark:bg-theme-900/40 z-0"
        style={{
          width: `${memUsedPercent}%`,
        }}
      />
      <span className="ml-2 h-2 w-2 z-10">
        <span className={classNames("block w-2 h-2 rounded", statusColor)} />
      </span>
      <div className="text-xs z-10 self-center ml-2 relative h-4 grow mr-2">
        <div className="absolute w-full whitespace-nowrap text-ellipsis overflow-hidden text-left">{name}</div>
      </div>
      <div className="self-center text-xs flex justify-end mr-1.5 pl-1 z-10 text-ellipsis overflow-hidden whitespace-nowrap">
        <span>
          {prettyBytes(memoryUsedBytes)} / {prettyBytes(memoryTotalBytes)}
        </span>
        <span className="pl-2">({cpuUsedPercent}%)</span>
      </div>
    </div>
  );
}