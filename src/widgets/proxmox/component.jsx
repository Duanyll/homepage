import { useTranslation } from "next-i18next";
import Container from "components/services/widget/container";
import Block from "components/services/widget/block";

import useWidgetAPI from "utils/proxy/use-widget-api";
import { NodeDetail, VmDetail } from "widgets/proxmox/detail";

function calcRunning(total, current) {
  return current.status === "running" ? total + 1 : total;
}

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: clusterData, error: clusterError } = useWidgetAPI(widget, "cluster/resources");

  if (clusterError) {
    return <Container service={service} error={clusterError} />;
  }

  if (!clusterData || !clusterData.data) {
    return (
      <Container service={service}>
        <Block label="proxmox.vms" />
        <Block label="proxmox.lxc" />
        <Block label="resources.cpu" />
        <Block label="resources.mem" />
      </Container>
    );
  }

  const { data } = clusterData;
  const vms =
    data.filter(
      (item) => item.type === "qemu" && item.template === 0 && (widget.node === undefined || widget.node === item.node),
    ) || [];
  const lxc =
    data.filter(
      (item) => item.type === "lxc" && item.template === 0 && (widget.node === undefined || widget.node === item.node),
    ) || [];
  const nodes =
    data.filter(
      (item) =>
        item.type === "node" && item.status === "online" && (widget.node === undefined || widget.node === item.node),
    ) || [];
  const runningVMs = vms.reduce(calcRunning, 0);
  const runningLXC = lxc.reduce(calcRunning, 0);

  if (nodes.length === 0) {
    return (
      <Container service={service}>
        <Block label="proxmox.vms" value={`${runningVMs} / ${vms.length}`} />
        <Block label="proxmox.lxc" value={`${runningLXC} / ${lxc.length}`} />
        <Block label="resources.cpu" />
        <Block label="resources.mem" />
      </Container>
    );
  }

  const maxMemory = nodes.reduce((sum, n) => n.maxmem + sum, 0);
  const usedMemory = nodes.reduce((sum, n) => n.mem + sum, 0);
  const maxCpu = nodes.reduce((sum, n) => n.maxcpu + sum, 0);
  const usedCpu = nodes.reduce((sum, n) => n.cpu * n.maxcpu + sum, 0);

  const detailsList = [];
  const enableNodes = widget?.enableNodes && nodes.length > 0;
  if (enableNodes) {
    const nodesDict = {};
    nodes.forEach((item) => {
      const newItem = { ...item, runningVms: 0, totalVms: 0 };
      nodesDict[newItem.node] = newItem;
    });
    const countVm = (item) => {
      if (nodesDict[item.node]) {
        nodesDict[item.node].totalVms += 1;
        if (item.status === "running") {
          nodesDict[item.node].runningVms += 1;
        }
      }
    };
    vms.forEach(countVm);
    lxc.forEach(countVm);
    detailsList.push(
      ...Object.values(nodesDict)
        .sort((a, b) => a.node.localeCompare(b.node))
        .map((node) => (
          <NodeDetail
            key={node.node}
            name={node.node}
            online={node.status === "online"}
            runningVmCount={node.runningVms}
            totalVmCount={node.totalVms}
            memoryUsedBytes={node.mem}
            memoryTotalBytes={node.maxmem}
            cpuUsage={node.cpu}
          />
        )),
    );
  }

  const enableVms = widget?.enableVms;
  if (enableVms) {
    detailsList.push(
      ...vms
        .concat(lxc)
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((item) => (
          <VmDetail
            key={item.name}
            name={item.name}
            running={item.status === "running"}
            cpuUsage={item.cpu}
            memoryUsedBytes={item.mem}
            memoryTotalBytes={item.maxmem}
          />
        )),
    );
  }

  return (
    <>
      <Container service={service}>
        <Block label="proxmox.vms" value={`${runningVMs} / ${vms.length}`} />
        <Block label="proxmox.lxc" value={`${runningLXC} / ${lxc.length}`} />
        <Block label="resources.cpu" value={t("common.percent", { value: (usedCpu / maxCpu) * 100 })} />
        <Block label="resources.mem" value={t("common.percent", { value: (usedMemory / maxMemory) * 100 })} />
      </Container>
      {detailsList}
    </>
  );
}
